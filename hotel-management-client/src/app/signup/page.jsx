"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogOut = () => {
  const router = useRouter();
  useEffect(() => {
    localStorage.removeItem("the_token");
    localStorage.removeItem("the_user");
    router.replace("/login");
  }, [router]);

  return null;
};

export default LogOut;
