"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LoginButton } from "@/components/LoginButton";
import { BookmarkApp } from "@/components/BookmarkApp";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

export default function Home() {
  const { user, loading } = useAuth();
  console.log({ user });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/recall-circle.png"
              alt="Recall Logo"
              width={64}
              height={64}
              className="mb-2"
              priority
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recall</h1>
            <p className="text-gray-600">Super simple bookmark manager</p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  return <BookmarkApp />;
}
