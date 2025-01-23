// app/(auth)/register/page.tsx
"use client";

import { useState } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm'; 
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface RegisterError {
  message: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unexpected error occurred');
      }

      toast({
        title: "Registration successful",
        description: "You can now log in.",
        duration: 2000,
      });

      setTimeout(() => {
        router.push('/login');
      }, 500);

    } catch (error) {
      const registerError = error as RegisterError;

      toast({
        variant: "destructive",
        title: "Registration failed",
        description: registerError.message || "An unexpected error occurred",
        duration: 3000,
      });

      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (name: string, email: string, password: string) => {
    await handleRegister(name, email, password);
  };

  return (
    <AuthLayout>
      <RegisterForm 
        onRegister={handleSubmit}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}
