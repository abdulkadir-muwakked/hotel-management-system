"use client";

import RoomsTable from "./roomsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Rooms() {
  const router = useRouter();

  return (
    <div className="p-4 space-y-6">
      {/* Header section (title, filters, button) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Rooms Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all rooms and their reservations.
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
              router.push("rooms/create");
            }}
          >
            Add New Room
          </Button>
        </div>
      </div>

      {/* جدول الغرف */}
      <RoomsTable />
    </div>
  );
}
