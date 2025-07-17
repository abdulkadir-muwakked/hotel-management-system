"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getUserById,
  updateUser,
  uploadUserAvatar,
  uploadUserDocuments,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [userDocuments, setUserDocuments] = useState([]);
  const fileInputRef = useRef();

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

  const handleChange = (e) => {
    setUser((prev) => {
      const updated = { ...prev, [e.target.name]: e.target.value };

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Only send allowed fields for update, and ensure isActive is boolean or undefined
      const { username, email, phone, address, role, nationalId, notes } = user;
      let isActive = user.isActive;
      // Convert string to boolean if needed
      if (typeof isActive === "string") {
        if (isActive.toLowerCase() === "true") isActive = true;
        else if (isActive.toLowerCase() === "false") isActive = false;
        else isActive = undefined;
      }
      // Do not send role if not admin
      let updateData = {
        username,
        email,
        phone,
        address,
        nationalId,
        isActive,
        notes,
      };
      if (user.currentUserRole === "admin") {
        updateData.role = role;
      }
      await updateUser(userId, updateData);
      router.push("/users");
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setError("");
    try {
      await uploadUserAvatar(userId, file);
      // Refresh user data
      const found = await getUserById(userId);
      setUser(found.user || found);
    } catch (err) {
      setError(err.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDocumentsChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const handleUploadDocuments = async () => {
    try {
      await uploadUserDocuments(userId, documents);
      setDocuments([]);
    } catch (err) {
      setUploadError(err.message || "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={`http://localhost:3000/${user?.avatar?.filePath}`}
              />
              <AvatarFallback>
                {user.username?.[0] || user.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? "Uploading..." : "Change Avatar"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={user.username || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={user.email || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={user.phone || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="nationalId">National ID</Label>
            <Input
              id="nationalId"
              name="nationalId"
              value={user.nationalId || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={user.address || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={user.notes || ""}
              onChange={handleChange}
            />
          </div>
          {/* Only allow admin to change role */}
          {user.currentUserRole === "admin" && (
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                name="role"
                value={user.role || ""}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="documents" className="block font-medium mb-1">
              Upload Documents
            </label>
            {/* Show existing documents if any */}
            {userDocuments.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-sm mb-1">
                  Existing Documents:
                </div>
                <ul className="list-disc pl-5">
                  {userDocuments.map((doc, idx) => {
                    const fileUrl = `http://localhost:3000/${doc.filePath}`;
                    const fileName =
                      doc.fileName ||
                      doc.originalname ||
                      doc.name ||
                      `Document ${idx + 1}`;
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
            <input
              id="documents"
              name="documents"
              type="file"
              multiple
              onChange={handleDocumentsChange}
              className="w-full border rounded px-2 py-2 mb-2"
            />
            <Button
              type="button"
              className="mt-2"
              onClick={handleUploadDocuments}
              disabled={uploading || !documents.length}
            >
              {uploading ? "Uploading..." : "Upload Documents"}
            </Button>
            {uploadError && (
              <div className="text-red-500 text-sm mt-2">{uploadError}</div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/users")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
