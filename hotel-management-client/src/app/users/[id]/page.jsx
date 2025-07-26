"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById } from "@/lib/utils";
import UserCard from "@/components/UserCard";

export default function UserViewPage({ user }) {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;
  const [userData, setUserData] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setUserData(user);
      setLoading(false);
      return;
    }
    async function fetchUser() {
      setLoading(true);
      try {
        const found = await getUserById(userId);
        setUserData(found.user || found);
      } catch (err) {
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchUser();
  }, [userId, user]);

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  return <UserCard user={userData} />;
}
