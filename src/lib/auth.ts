import { PrismaAdapter } from "@auth/prisma-adapter";
import { DefaultSession, NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { compare } from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailProviderOptions {
  identifier: string;
  url: string;
  provider: { from: string };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    EmailProvider({
      from: process.env.SMTP_FROM || "no-reply@ecom-store.demo",
      sendVerificationRequest: async ({
        identifier,
        url,
        provider,
      }: EmailProviderOptions) => {
        try {
          const result = await resend.emails.send({
            from: provider.from as string,
            to: identifier,
            subject: "Sign in to Ecom Store",
            html: `<body>
                    <h1>Welcome to Ecom Store</h1>
                    <p>Click the link below to sign in:</p>
                    <a href="${url}">Sign in</a>
                    <p>If you didn't request this email, you can safely ignore it.</p>
                  </body>`,
          });
          if (result.error) {
            throw new Error(result.error.message);
          }
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
        };
      }
      return token;
    },
  },
};
