"use client";

import { useAuth } from "../../firebase/auth/useAuth";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";

export default function AuthButton() {
  const auth: any = useAuth();
  const user = auth?.user;
  if (user) return <LogoutButton />;
  return <LoginButton />;
}
