import { EditProductWrapper } from "@/components/admin/products/EditProductWrapper";

// Define the params type according to Next.js 15 conventions, matching other routes
interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Server component that receives route params
export default async function EditProductPage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return <EditProductWrapper productId={id} />;
}
