"use client";

import { useState, type FormEvent } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // Here you would typically make an API call to your newsletter service
      // await subscribeToNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-600 mb-8">
            Be the first to know about new collections and exclusive offers.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 min-w-0 px-4 py-3 text-base text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:border-black"
              required
              disabled={status === "loading"}
              aria-label="Email address"
            />
            <button
              type="submit"
              className="bg-black px-8 py-3 text-sm font-medium text-white hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {status === "success" && (
            <p className="mt-4 text-sm text-green-600">
              Thank you for subscribing!
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-red-600">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
