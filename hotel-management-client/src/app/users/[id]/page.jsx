"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserById } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function UserViewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const found = await getUserById(userId);
        // If API returns {user: {...}}, unwrap it
        setUser(found.user || found);
      } catch (err) {
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;
  // Unwrap if still nested
  const u = user.user || user;
  console.log("user", u);

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={`http://localhost:3000/${u?.avatar?.filePath}`} />
            <AvatarFallback>
              {u.username?.[0] || u.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{u.username}</h2>
            <Badge>{u.role}</Badge>
          </div>
        </div>
        <div className="mb-2 text-gray-700">Email: {u.email}</div>
        <div className="mb-2 text-gray-700">Phone: {u.phone || "-"}</div>
        <div className="mb-2 text-gray-700">National ID: {u.nationalId || "-"}</div>
        <div className="mb-2 text-gray-700">Address: {u.address || "-"}</div>
        <div className="mb-2 text-gray-700">Notes: {u.notes || "-"}</div>
        <div className="mb-2 text-gray-700">Active: {u.isActive === true ? "Yes" : u.isActive === false ? "No" : "-"}</div>
        <div className="mb-2 text-gray-700">
          Created: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
        </div>
        <Button variant="outline" onClick={() => router.push("/users")}>
          Back to Users
        </Button>
      </Card>
    </div>
  );
}
