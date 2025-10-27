"use client";

import { useRouter } from "next/navigation";
import { logout } from "../../firebase/auth/authService";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="destructive"
      onClick={async () => {
        try {
          await logout();
          router.push("/");
        } catch (e) {
          console.error(e);
        }
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  );
}
