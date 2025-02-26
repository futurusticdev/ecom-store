"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ReviewResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: Array<{
    productId: string;
    reviewsAdded: number;
  }>;
}

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [reviewCount, setReviewCount] = useState(5);
  const [productLimit, setProductLimit] = useState(10);
  const [result, setResult] = useState<ReviewResult | null>(null);

  // Seed reviews for a specific product
  const seedProductReviews = async () => {
    if (!productId) {
      toast.error("Please enter a product ID");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/reviews/seed?productId=${productId}&count=${reviewCount}`
      );
      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully added ${reviewCount} reviews to product ${productId}`
        );
        setResult(data);
      } else {
        toast.error(data.error || "Failed to seed reviews");
      }
    } catch (error) {
      toast.error("An error occurred while seeding reviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Seed reviews for all products
  const seedAllProductReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/reviews/seed-all?limit=${productLimit}&count=${reviewCount}`
      );
      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully added reviews to ${data.details.length} products`
        );
        setResult(data);
      } else {
        toast.error(data.error || "Failed to seed reviews");
      }
    } catch (error) {
      toast.error("An error occurred while seeding reviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Review Management</h1>
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Total Reviews
              </p>
              <p className="text-3xl font-bold mt-2">1,245</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Average Rating
              </p>
              <p className="text-3xl font-bold mt-2">4.2 / 5</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Products with Reviews
              </p>
              <p className="text-3xl font-bold mt-2">87%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Management Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-6">Generate Fake Reviews</h2>
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="single">Single Product</TabsTrigger>
            <TabsTrigger value="all">All Products</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Add Reviews to a Single Product</CardTitle>
                <CardDescription>
                  Generate fake reviews for a specific product by ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Product ID</Label>
                  <Input
                    id="productId"
                    placeholder="Enter product ID"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewCount">Number of Reviews</Label>
                  <Input
                    id="reviewCount"
                    type="number"
                    min="1"
                    max="20"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={seedProductReviews}
                  disabled={loading || !productId}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Reviews...
                    </>
                  ) : (
                    "Generate Reviews"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Add Reviews to Multiple Products</CardTitle>
                <CardDescription>
                  Generate fake reviews for multiple products at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productLimit">Number of Products</Label>
                  <Input
                    id="productLimit"
                    type="number"
                    min="1"
                    placeholder="Leave empty for all products"
                    value={productLimit}
                    onChange={(e) => setProductLimit(parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Set how many products should receive reviews (leave empty
                    for all)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulkReviewCount">Reviews Per Product</Label>
                  <Input
                    id="bulkReviewCount"
                    type="number"
                    min="1"
                    max="20"
                    value={reviewCount}
                    onChange={(e) => setReviewCount(parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={seedAllProductReviews}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Reviews...
                    </>
                  ) : (
                    "Generate Reviews for Multiple Products"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
