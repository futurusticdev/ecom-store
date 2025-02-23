import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2574&auto=format&fit=crop"
          alt="Woman in luxury fashion attire"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-[center_20%]"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Overlay */}
      <div className="relative flex h-full items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            New Collection 2025
          </h1>
          <p className="mb-10 text-lg text-white/90 sm:text-xl">
            Discover the latest trends in luxury fashion
          </p>
          <Link
            href="/new-arrivals"
            className="inline-flex items-center justify-center bg-white px-8 py-4 text-sm font-medium text-black transition-all hover:bg-white/90 hover:shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
