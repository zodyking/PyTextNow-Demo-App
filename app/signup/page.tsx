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
  Textarea,
} from "@heroui/react";
import { ArrowLeft, User, Lock, Cookie, Key } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    textnowUsername: "",
    sidCookie: "",
    csrfCookie: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (
      !formData.username ||
      !formData.password ||
      !formData.textnowUsername ||
      !formData.sidCookie ||
      !formData.csrfCookie
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Save user to database via API
      const response = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          textnowUsername: formData.textnowUsername,
          sidCookie: formData.sidCookie,
          csrfCookie: formData.csrfCookie,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Save user to localStorage for session management
      localStorage.setItem("textnow_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 py-8">
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
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-gray-400 text-sm">
              Set up your account and TextNow API credentials
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-white font-semibold text-sm">
                  Account Information
                </h3>

                <Input
                  type="text"
                  label="Username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  required
                  classNames={{
                    input: "text-white focus:outline-none",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                  }}
                  startContent={<User className="w-4 h-4 text-gray-400" />}
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  classNames={{
                    input: "text-white focus:outline-none",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                  }}
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                />

                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  required
                  classNames={{
                    input: "text-white focus:outline-none",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                  }}
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-white font-semibold text-sm">
                  TextNow API Credentials
                </h3>
                <p className="text-gray-400 text-xs">
                  These are required to use the TextNow API. Get them from your
                  browser's developer tools when logged into TextNow.
                </p>

                <Input
                  type="text"
                  label="TextNow Username"
                  placeholder="Your TextNow username"
                  value={formData.textnowUsername}
                  onChange={(e) =>
                    handleChange("textnowUsername", e.target.value)
                  }
                  required
                  classNames={{
                    input: "text-white focus:outline-none",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                  }}
                  startContent={<User className="w-4 h-4 text-gray-400" />}
                />

                <Textarea
                  label="Connect.sid Cookie"
                  placeholder="Paste your connect.sid cookie value"
                  value={formData.sidCookie}
                  onChange={(e) => handleChange("sidCookie", e.target.value)}
                  required
                  minRows={2}
                  classNames={{
                    input: "text-white focus:outline-none",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                  }}
                  startContent={<Cookie className="w-4 h-4 text-gray-400" />}
                />

                <Input
                  type="text"
                  label="CSRF Cookie"
                  placeholder="Paste your _csrf cookie value"
                  value={formData.csrfCookie}
                  onChange={(e) => handleChange("csrfCookie", e.target.value)}
                  required
                  classNames={{
                    input: "text-white focus:outline-none",
                    label: "text-gray-400",
                    inputWrapper: "bg-[#0a0a0a] border-gray-700 focus-within:border-gray-700 focus-within:ring-0 focus-within:ring-offset-0",
                  }}
                  startContent={<Key className="w-4 h-4 text-gray-400" />}
                />
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full bg-electric-500 text-white font-semibold mt-6"
                isLoading={loading}
              >
                Create Account
              </Button>

              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-electric-500 hover:text-electric-400"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

