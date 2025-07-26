// src/components/CreateUserForm.jsx
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  uploadUserAvatar,
  createUser as createUserApi,
  uploadUserDocuments,
} from "@/lib/utils";
import { useRouter } from "next/navigation";

const ROLES = ["customer", "broker", "student", "doctor"];

export default function CreateUserForm({
  initialName = "",
  onCreated,
  isCustomer = false,
}) {
  const { user: currentUser } = useAuth();
  const { addUser } = useUsers();
  const router = useRouter();
  const [form, setForm] = useState({
    username: initialName,
    email: "",
    phone: "",
    nationalId: "",
    address: "",
    notes: "",
    role: ROLES[0],
    avatar: null,
    password: "",
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

  const handleDocumentsChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const handleUploadDocuments = async (userId, docs) => {
    try {
      await uploadUserDocuments(userId, docs);
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
      const { avatar, ...userData } = form;
      // Remove password if isCustomer
      if (isCustomer) {
        delete userData.password;
        if (!userData.email) delete userData.email;
        userData.role = "customer";
      }
      // Validate required fields
      if (!form.username) throw new Error("Username is required");
      if (!isCustomer && !form.email) throw new Error("Email is required");
      if (!isCustomer && !form.password)
        throw new Error("Password is required");
      const data = await createUserApi(userData);
      if (avatar && data.id) {
        await uploadUserAvatar(data.id, avatar);
      }
      if (docs.length && data.id) {
        await handleUploadDocuments(data.id, docs);
      }
      addUser({ ...data, avatar: data.avatar || avatar });
      setCreatedUserId(data.id);
      if (typeof onCreated === "function") {
        onCreated(data);
      } else {
        router.push("/users");
      }
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

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
            required={!isCustomer}
          />
        </div>
        {!isCustomer && (
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
        )}
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
            onChange={handleDocumentsChange}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {documents.map((file, idx) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(
                file.name
              );
              if (isImage) {
                const url = URL.createObjectURL(file);
                return (
                  <img
                    key={idx}
                    src={url}
                    alt={file.name}
                    className="max-h-24 rounded border shadow"
                    style={{ maxWidth: "100px", objectFit: "contain" }}
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                );
              }
              return null;
            })}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </Button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
}
