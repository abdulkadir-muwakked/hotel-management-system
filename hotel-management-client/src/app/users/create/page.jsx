"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/AuthContext";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { uploadUserAvatar, createUser, uploadUserDocuments } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ROLES = ["customer", "broker", "student", "doctor"];

export default function CreateUserPage() {
  const { user: currentUser } = useAuth();
  const { addUser } = useUsers();
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    nationalId: "",
    address: "",
    notes: "",
    role: ROLES[0],
    avatar: null,
    password: "", // Add password field
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [createdUserId, setCreatedUserId] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, avatar: file }));
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  const handleUploadDocuments = async (userId, docs) => {
    try {
      await uploadUserDocuments(userId, docs);
      // Optionally: show success message or update user context
    } catch (err) {
      setError(err.message || "Failed to upload documents");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let docs = documents;
    try {
      // 1. Submit user as JSON (without avatar) using createUser from utils
      const { avatar, ...userData } = form;
      const data = await createUser(userData); // createUser expects an object, not FormData
      // 2. If avatar present, upload it using uploadUserAvatar from utils
      if (avatar && data.id) {
        await uploadUserAvatar(data.id, avatar);
      }
      // 3. If documents were selected in the file input, get them here
      const docsInput = document.getElementById("documents");
      if (docsInput && docsInput.files.length) {
        docs = Array.from(docsInput.files);
      }
      // 4. Upload documents if present
      if (docs.length && data.id) {
        await handleUploadDocuments(data.id, docs);
      }
      // Add the new user to context for instant update
      addUser({ ...data, avatar: data.avatar || avatar });
      setCreatedUserId(data.id); // Save for further actions
      router.push("/users");
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // Only admin or receptionist can access
  if (!currentUser || !["admin", "receptionist"].includes(currentUser.role)) {
    return <div className="text-red-500">Access denied</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create User</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="username">Username</Label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <input
            id="phone"
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
          />
        </div>
        <div>
          <Label htmlFor="nationalId">National ID</Label>
          <input
            id="nationalId"
            name="nationalId"
            type="text"
            value={form.nationalId}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <input
            id="notes"
            name="notes"
            type="text"
            value={form.notes}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
          />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded px-2 py-2 mb-2"
            required
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarPreview || undefined} />
            <AvatarFallback>
              {form.username?.[0] || form.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("avatar-input").click()}
            >
              Change Avatar
            </Button>
            <input
              id="avatar-input"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="documents">Documents</Label>
          <input
            id="documents"
            name="documents"
            type="file"
            multiple
            className="w-full border rounded px-2 py-2 mb-2"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
}
