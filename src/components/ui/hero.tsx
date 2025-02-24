import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2670&auto=format&fit=crop"
          alt="Elegant fashion model in modern attire"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center transform scale-105 transition-transform duration-10000 hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      </div>

      {/* Content Overlay */}
      <div className="relative flex h-full items-center justify-center px-4">
        <div className="max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Elevate Your Style
          </h1>
          <p className="mb-10 text-lg text-white/90 sm:text-xl md:text-2xl font-light">
            Curated collections for the modern fashion enthusiast
          </p>
          <Link
            href="/products"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-white px-8 py-4 text-sm font-medium text-black transition-all hover:bg-white/90"
          >
            <span className="relative z-10">Explore Collection</span>
            <div className="absolute inset-0 -translate-x-full bg-black transition-transform duration-300 ease-out group-hover:translate-x-0" />
            <span className="absolute z-20 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Explore Collection
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
