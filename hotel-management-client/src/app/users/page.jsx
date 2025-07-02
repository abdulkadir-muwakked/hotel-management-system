"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import UsersTable from "./usersTable";

export default function Users() {
  const router = useRouter();

  return (
    <div className="p-4 space-y-6">
      {/* Header section (title, filters, button) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Users Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all Users and their reservations.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {/* Filter input (يمكنك تبديله بـ Select لاحقاً) */}
          <Input
            type="text"
            placeholder="Filter by number, type..."
            className="w-64"
          />

          {/* زر إضافة غرفة */}
          <Button
            onClick={() => {
              router.push("users/create");
            }}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* جدول الغرف */}
      <UsersTable />
    </div>
  );
}
