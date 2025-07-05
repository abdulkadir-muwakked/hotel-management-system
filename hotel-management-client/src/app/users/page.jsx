"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useUsers } from "@/contexts/AuthContext";
import UsersTable from "./usersTable";

export default function Users() {
  const router = useRouter();
  const { setUserFilters, userFilters, loading } = useUsers();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");

  React.useEffect(() => {
    setUserFilters({
      search,
      role,
      active,
    });
    // eslint-disable-next-line
  }, [search, role, active]);

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
          {/* Filter inputs */}
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            className="w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={role} onValueChange={(val) => setRole(val)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="receptionist">Receptionist</option>
            <option value="broker">Broker</option>
            <option value="customer">Customer</option>
            <option value="student">Student</option>
            <option value="doctor">Doctor</option>
          </Select>
          <Select value={active} onValueChange={(val) => setActive(val)}>
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>

          {/* Add New User button */}
          <Button
            onClick={() => {
              router.push("users/create");
            }}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && <div className="text-center text-gray-500">Loading...</div>}

      {/* Users table */}
      <UsersTable />
    </div>
  );
}
