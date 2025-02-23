import ProductClient from "./product-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <ProductClient params={{ slug }} />;
}
