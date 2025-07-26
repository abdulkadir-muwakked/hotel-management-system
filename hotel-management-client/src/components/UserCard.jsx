// app/(dashboard)/users/_components/UserCard.jsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function UserCard({ user }) {
  if (!user) return <div>User not found</div>;
  // Unwrap if still nested
  const u = user.user || user;
  const userDocuments = u.documents || [];

  return (
    <Card className="p-6 w-full max-w-xl">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-16 h-16">
          <AvatarImage
            src={
              u.avatar?.filePath
                ? `http://localhost:3000/${u.avatar.filePath}`
                : undefined
            }
          />
          <AvatarFallback>
            {u.username?.[0] || u.email?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{u.username}</h2>
          {u.role && <Badge>{u.role}</Badge>}
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
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
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
    </Card>
  );
}
