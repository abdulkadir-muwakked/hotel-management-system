// ✅ src/app/users/create/page.jsx
"use client";
import CreateUserForm from "@/components/CreateUserForm";
import { UsersProvider } from "@/hooks/useUsers";

export default function CreateUserPage() {
  return (
    <UsersProvider>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create New User</h1>
        <CreateUserForm requireEmail={true} requirePassword={true} />
      </div>
    </UsersProvider>
  );
}
