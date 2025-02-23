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
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    likes: 124,
    comments: 12,
    href: "#",
  },
  {
    id: "2",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
    likes: 98,
    comments: 8,
    href: "#",
  },
  {
    id: "3",
    imageUrl:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop",
    likes: 156,
    comments: 15,
    href: "#",
  },
  {
    id: "4",
    imageUrl:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000&auto=format&fit=crop",
    likes: 201,
    comments: 18,
    href: "#",
  },
  {
    id: "5",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop",
    likes: 167,
    comments: 14,
    href: "#",
  },
  {
    id: "6",
    imageUrl:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1000&auto=format&fit=crop",
    likes: 143,
    comments: 11,
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              className="group relative aspect-square overflow-hidden bg-gray-100"
            >
              <Image
                src={post.imageUrl}
                alt="Instagram post"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(min-width: 1280px) 16vw, (min-width: 768px) 33vw, 50vw"
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
                    {post.likes}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2h-2v3l-4-3H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8z" />
                    </svg>
                    {post.comments}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
