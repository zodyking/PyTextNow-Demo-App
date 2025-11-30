"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-6xl font-bold text-electric-500">404</h1>
        <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
        <p className="text-gray-400">
          The page you're looking for doesn't exist.
        </p>
        <Button
          as={Link}
          href="/"
          color="primary"
          className="bg-electric-500 text-white"
          startContent={<Home className="w-4 h-4" />}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}

