"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleLogin = async (identifier: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }), // Send 'identifier' to the API
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unexpected error occurred");
      }

      const data = await response.json();
      localStorage.setItem("isAuthenticated", "true");

      // Extract userId from cookies
      const userId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
        ?.split("=")[1];

      if (userId) {
        setUserId(userId);
      }

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/dashboard/main");
      }, 500);
    } catch (error) {
      const loginError = error as Error;

      toast({
        variant: "destructive",
        title: "Login failed",
        description: loginError.message || "An unexpected error occurred",
        duration: 3000,
      });

      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (identifier: string, password: string) => {
    await handleLogin(identifier, password);
  };

  return (
    <AuthLayout>
      <LoginForm
        onLogin={handleSubmit}
        isLoading={isLoading}
      />
      {userId && <p>User ID: {userId}</p>}
    </AuthLayout>
  );
}
