"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
} from "@heroui/react";
import { ArrowLeft, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Authenticate user via API
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid username or password");
        setLoading(false);
        return;
      }

      // Save current user to localStorage for session management
      localStorage.setItem("textnow_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Button
          variant="light"
          className="mb-4 text-electric-500"
          onPress={() => router.push("/")}
          startContent={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>

        <Card className="bg-[#1a1a1a] border border-gray-800">
          <CardHeader className="flex flex-col gap-1 pb-4">
            <h1 className="text-2xl font-bold text-white">Sign In</h1>
            <p className="text-gray-400 text-sm">
              Enter your credentials to access your account
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Input
                type="text"
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                classNames={{
                  input: "text-white focus:outline-none",
                  label: "text-gray-400",
                  inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                }}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                classNames={{
                  input: "text-white focus:outline-none",
                  label: "text-gray-400",
                  inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                }}
                startContent={<Lock className="w-4 h-4 text-gray-400" />}
              />

              <Button
                type="submit"
                color="primary"
                className="w-full bg-electric-500 text-white font-semibold"
                isLoading={loading}
              >
                Sign In
              </Button>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-electric-500 hover:text-electric-400"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

