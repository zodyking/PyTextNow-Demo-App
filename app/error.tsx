"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Something went wrong!</h2>
        <p className="text-gray-400">{error.message}</p>
        <Button
          color="primary"
          className="bg-electric-500 text-white"
          onPress={reset}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}


