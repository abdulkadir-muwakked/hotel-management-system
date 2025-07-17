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
  const [userDocuments, setUserDocuments] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const found = await getUserById(userId);
        setUser(found.user || found);
        // If user has documents, set them
        const docs = (found.user || found).documents || [];
        setUserDocuments(docs);
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
        <div className="mb-2 text-gray-700">
          National ID: {u.nationalId || "-"}
        </div>
        <div className="mb-2 text-gray-700">Address: {u.address || "-"}</div>
        <div className="mb-2 text-gray-700">Notes: {u.notes || "-"}</div>
        <div className="mb-2 text-gray-700">
          Active:{" "}
          {u.isActive === true ? "Yes" : u.isActive === false ? "No" : "-"}
        </div>
        <div className="mb-2 text-gray-700">
          Created: {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
        </div>
        {/* Show existing documents if any */}
        {userDocuments.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold text-sm mb-1">Documents:</div>
            <ul className="list-disc pl-5">
              {userDocuments.map((doc, idx) => {
                const fileUrl = `http://localhost:3000/${doc.filePath}`;
                const fileName =
                  doc.originalname || doc.name || `Document ${idx + 1}`;
                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(
                  fileUrl
                );
                return (
                  <li key={doc._id || doc.id || idx} className="mb-2">
                    {isImage ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={fileUrl}
                          alt={fileName}
                          className="max-h-32 rounded shadow border mb-1"
                          style={{ maxWidth: "100%", objectFit: "contain" }}
                        />
                      </a>
                    ) : (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {fileName}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <Button variant="outline" onClick={() => router.push("/users")}>
          Back to Users
        </Button>
      </Card>
    </div>
  );
}
