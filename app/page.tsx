"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("textnow_user");
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    // Track mouse position for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    // Create animated particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2,
    }));
    setParticles(newParticles);

    // Animate particles
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: (p.y + p.speed) % 100,
          x: p.x + Math.sin(p.y * 0.1) * 0.1,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen h-screen overflow-hidden bg-black text-white">
      {/* Animated Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-electric-500/20 blur-[120px] transition-all duration-1000 ease-out"
          style={{
            left: `${mousePosition.x * 0.5}%`,
            top: `${mousePosition.y * 0.5}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full bg-electric-600/15 blur-[100px] transition-all duration-1500 ease-out"
          style={{
            left: `${100 - mousePosition.x * 0.3}%`,
            top: `${100 - mousePosition.y * 0.3}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full bg-electric-400/10 blur-[80px] transition-all duration-2000 ease-out"
          style={{
            left: `${mousePosition.x * 0.7}%`,
            top: `${100 - mousePosition.y * 0.7}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-electric-500/30 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.size}px rgba(0, 121, 230, 0.3)`,
              animation: `float ${3 + particle.id % 3}s ease-in-out infinite`,
              animationDelay: `${particle.id * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Animated Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 121, 230, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 121, 230, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
        }}
      />

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center animate-pulse">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-electric-400 to-electric-600 bg-clip-text text-transparent">
              PyTextNow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              className="text-gray-300 hover:text-white hidden sm:flex"
              onPress={() => router.push("/login")}
            >
              Sign In
            </Button>
            <Button
              color="primary"
              className="bg-electric-500 text-white font-semibold"
              onPress={() => router.push("/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-8 max-w-5xl mx-auto w-full">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-electric-500 via-electric-600 to-electric-700 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(0,121,230,0.5)]">
                <MessageSquare className="w-16 h-16 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-electric-500/20 animate-ping" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-electric-400 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Main Heading with Animation */}
          <div className="space-y-4 px-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
              <span className="block bg-gradient-to-r from-white via-electric-200 to-electric-400 bg-clip-text text-transparent animate-gradient break-words">
                PyTextNow
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-light">
              Modern messaging, reimagined
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              color="primary"
              className="bg-electric-500 text-white font-semibold px-8 py-6 text-lg hover:bg-electric-600 transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(0,121,230,0.5)]"
              onPress={() => router.push("/signup")}
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              Start Messaging
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="border-electric-500/50 text-electric-400 font-semibold px-8 py-6 text-lg hover:border-electric-500 hover:bg-electric-500/10 transition-all duration-300"
              onPress={() => router.push("/login")}
            >
              Sign In
            </Button>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-electric-500/50 animate-float" />
          <div className="absolute bottom-20 right-10 w-3 h-3 rounded-full bg-electric-400/50 animate-float-delayed" />
          <div className="absolute top-1/2 left-20 w-1.5 h-1.5 rounded-full bg-electric-600/50 animate-float-slow" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-electric-500/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-electric-500 rounded-full animate-scroll" />
        </div>
      </div>

    </div>
  );
}
