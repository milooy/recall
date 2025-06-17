"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth";

export const LoginButton = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Button onClick={handleLogin} className="w-full">
      Login with Google
    </Button>
  );
};
