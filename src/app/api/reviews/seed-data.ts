import { createId } from "@paralleldrive/cuid2";

// Fake users for reviews
export const fakeUsers = [
  {
    id: "fake-user-1",
    name: "John Doe",
    email: "john@example.com",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "fake-user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: "fake-user-3",
    name: "Michael Johnson",
    email: "michael@example.com",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "fake-user-4",
    name: "Emily Brown",
    email: "emily@example.com",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: "fake-user-5",
    name: "Alex Taylor",
    email: "alex@example.com",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
];

// Sample review titles and comments for different rating levels
export const reviewContent = {
  excellent: {
    titles: [
      "Exceeded my expectations!",
      "Best purchase ever!",
      "Absolutely love it!",
      "Outstanding quality",
      "Highly recommend!",
    ],
    comments: [
      "This product is amazing. The quality is exceptional and it performs even better than advertised. I couldn't be happier with my purchase!",
      "I've tried many similar products before, but this one stands out. The attention to detail is impressive and it's clear that a lot of thought went into the design.",
      "Worth every penny! This has made a significant improvement to my daily routine and I'm already recommending it to all my friends.",
      "The craftsmanship is superb. It feels premium and durable, and I'm confident it will last for years to come.",
      "Absolutely perfect in every way. The shipping was fast, the packaging was secure, and the product itself is flawless.",
    ],
  },
  good: {
    titles: [
      "Very satisfied",
      "Good quality product",
      "Solid purchase",
      "Better than expected",
      "Happy with my choice",
    ],
    comments: [
      "I'm pleased with this product. It does everything it claims to do and seems well-made overall.",
      "Good value for the money. It has most of the features I was looking for and works consistently.",
      "I've been using this for a few weeks now and it's holding up nicely. No complaints so far.",
      "Delivery was quick and the product works as expected. I would buy from this brand again.",
      "A nice addition to my collection. It's not perfect but it definitely meets my needs.",
    ],
  },
  average: {
    titles: [
      "It's okay",
      "Does the job",
      "Average product",
      "Not bad, not great",
      "Adequate for the price",
    ],
    comments: [
      "This product is decent enough. It works but doesn't have any standout features that would make me recommend it enthusiastically.",
      "Middle of the road. I was hoping for a bit more given the price, but it's acceptable for my needs.",
      "It gets the job done, though there are a few minor issues that prevent me from giving it a higher rating.",
      "The quality is average. I've had it for a month and it's functional, but nothing special.",
      "It serves its purpose, but there's definitely room for improvement in terms of design and functionality.",
    ],
  },
  poor: {
    titles: [
      "Disappointed",
      "Not worth the money",
      "Expected better",
      "Wouldn't recommend",
      "Has serious flaws",
    ],
    comments: [
      "I'm quite disappointed with this purchase. The quality feels cheap and it doesn't perform as advertised.",
      "This product falls short in several areas. It's functional but barely, and I expected much more for the price.",
      "I've encountered multiple issues since I started using this. Customer service has been helpful, but the product itself is problematic.",
      "The design is flawed and it feels like corners were cut during manufacturing. I wouldn't recommend this to others.",
      "It worked fine for the first week, then started showing problems. I'm considering returning it if possible.",
    ],
  },
  terrible: {
    titles: [
      "Complete waste of money",
      "Avoid at all costs",
      "Extremely disappointing",
      "Failed on day one",
      "Regret this purchase",
    ],
    comments: [
      "This is possibly the worst product I've ever purchased. It broke within days and the quality is abysmal.",
      "I cannot stress enough how disappointing this product is. It doesn't work as described and feels incredibly cheap.",
      "Save your money and look elsewhere. This product is poorly designed, poorly made, and poorly supported.",
      "I had high hopes based on the description and photos, but the reality is completely different. Not functional at all.",
      "I rarely leave negative reviews, but this product deserves it. Nothing about it meets expectations or justifies the cost.",
    ],
  },
};

// Helper functions
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getReviewContentForRating(rating: number) {
  if (rating === 5) return getRandomElement(reviewContent.excellent.titles);
  if (rating === 4) return getRandomElement(reviewContent.good.titles);
  if (rating === 3) return getRandomElement(reviewContent.average.titles);
  if (rating === 2) return getRandomElement(reviewContent.poor.titles);
  return getRandomElement(reviewContent.terrible.titles);
}

export function getReviewCommentForRating(rating: number) {
  if (rating === 5) return getRandomElement(reviewContent.excellent.comments);
  if (rating === 4) return getRandomElement(reviewContent.good.comments);
  if (rating === 3) return getRandomElement(reviewContent.average.comments);
  if (rating === 2) return getRandomElement(reviewContent.poor.comments);
  return getRandomElement(reviewContent.terrible.comments);
}

// Generate a specific number of fake reviews for a product
export function generateFakeReviews(productId: string, count: number = 8) {
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const user = getRandomElement(fakeUsers);
    const rating = Math.floor(Math.random() * 5) + 1; // 1-5
    const title = getReviewContentForRating(rating);
    const comment = getReviewCommentForRating(rating);
    const createdAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ); // Random date in last 30 days
    const isVerified = Math.random() > 0.3; // 70% chance of being verified

    // Create a review object with the generated data
    const review = {
      id: createId(),
      productId,
      userId: user.id,
      rating,
      title,
      comment,
      isVerified,
      createdAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    };

    reviews.push(review);
  }

  return reviews;
}
