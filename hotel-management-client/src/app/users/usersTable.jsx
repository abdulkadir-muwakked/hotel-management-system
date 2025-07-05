"use client";

import { useUsers } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/utils";

// users;
export default function UsersTable() {
  const { users, loading } = useUsers();
  const router = useRouter();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      window.location.reload(); // Or trigger a context refresh if available
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="text-center text-gray-400">No users found.</div>;
  }

  return (
    <Table>
      <TableCaption>A list of your recent users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Avatar</TableHead>
          <TableHead>phone</TableHead>
          <TableHead className="text-right">Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(
          (user) => (
            console.log("user", user),
            (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  <Avatar>
                    <AvatarImage
                      src={
                        user?.avatar?.filePath
                          ? `http://localhost:3000/${user.avatar.filePath}`
                          : undefined
                      }
                    />
                    <AvatarFallback>
                      {user.username?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                {/* <TableCell>{user.role}</TableCell> */}
                <TableCell className="text-right">{user.role}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-7 h-7 p-0"
                      onClick={() => router.push(`/users/${user.id}`)}
                      title="View"
                    >
                      <span className="sr-only">View</span>
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z" />
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-7 h-7 p-0"
                      onClick={() => router.push(`/users/${user.id}/edit`)}
                      title="Edit"
                    >
                      <span className="sr-only">Edit</span>
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16.475 3.925a3.121 3.121 0 0 1 4.425 4.425L7.5 21.75l-4.5 1 1-4.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-7 h-7 p-0"
                      onClick={() => handleDelete(user.id)}
                      title="Delete"
                    >
                      <span className="sr-only">Delete</span>
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m5 4v6m4-6v6" />
                      </svg>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          )
        )}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}
