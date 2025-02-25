import { formatDate } from "@/lib/utils";
import { Rating } from "@/components/ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewItemProps {
  review: {
    id: string;
    title?: string | null;
    comment?: string | null;
    rating: number;
    createdAt: string | Date;
    isVerified: boolean;
    user: {
      id: string;
      name?: string | null;
      image?: string | null;
    };
  };
  className?: string;
}

export function ReviewItem({ review, className }: ReviewItemProps) {
  const date =
    typeof review.createdAt === "string"
      ? new Date(review.createdAt)
      : review.createdAt;

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn("space-y-3 py-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={review.user.image || ""}
              alt={review.user.name || "User"}
            />
            <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm leading-none">
              {review.user.name || "Anonymous User"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(date)}
            </p>
          </div>
        </div>
        <Rating value={review.rating} readOnly size="sm" />
      </div>

      {review.isVerified && (
        <div className="flex items-center text-xs text-green-600 gap-1">
          <Check className="h-3 w-3" />
          <span>Verified Purchase</span>
        </div>
      )}

      {review.title && (
        <h4 className="font-medium text-base">{review.title}</h4>
      )}

      {review.comment && (
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {review.comment}
        </p>
      )}
    </div>
  );
}
