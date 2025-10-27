"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function LoginButton() {
  return (
    <Link href="/login">
      <Button>
        <LogIn className="mr-2 h-4 w-4" />
        Log in
      </Button>
    </Link>
  );
}
