import { Hero } from "@/components/ui/hero";
import { ShopByCategory } from "@/components/ui/shop-by-category";
import { FeaturedProducts } from "@/components/ui/featured-products";
import { Newsletter } from "@/components/ui/newsletter";
import { InstagramFeed } from "@/components/ui/instagram-feed";

export default function Home() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <FeaturedProducts />
      <Newsletter />
      <InstagramFeed />
    </>
  );
}
