import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  href: string;
}

const instagramPosts: InstagramPost[] = [
  {
    id: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    likes: 2547,
    comments: 184,
    href: "#",
  },
  {
    id: "2",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    likes: 3102,
    comments: 243,
    href: "#",
  },
  {
    id: "3",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    likes: 4891,
    comments: 312,
    href: "#",
  },
  {
    id: "4",
    imageUrl:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80",
    likes: 3876,
    comments: 276,
    href: "#",
  },
  {
    id: "5",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    likes: 5234,
    comments: 428,
    href: "#",
  },
  {
    id: "6",
    imageUrl:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80",
    likes: 4123,
    comments: 297,
    href: "#",
  },
];

export function InstagramFeed() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light tracking-wide text-gray-900 mb-4">
            Follow Us on Instagram
          </h2>
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-gray-500 hover:text-gray-800 transition-colors font-light tracking-wide"
          >
            <Instagram className="w-5 h-5 mr-2" />
            @luxe
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative w-full pt-[100%]">
              <Link
                href={post.href}
                className="group absolute inset-0 overflow-hidden bg-gray-100"
              >
                <Image
                  src={post.imageUrl}
                  alt="Instagram post"
                  fill
                  priority={post.id === "1"}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(min-width: 1280px) 16vw, (min-width: 768px) 33vw, 50vw"
                  quality={85}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center space-x-4 text-white">
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2h-2v3l-4-3H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8z" />
                      </svg>
                      {post.comments.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
