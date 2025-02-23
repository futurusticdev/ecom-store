import React from "react";

export default function Loading(): React.JSX.Element {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
    </div>
  );
}
