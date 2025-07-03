"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import ReservationsTable from "./ReservationsTable";

export default function Reservations() {
  const router = useRouter();

  return (
    <div className="p-4 space-y-6">
      {/* Header section (title, filters, button) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reservations Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all reservations and their details.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Filter by room, type, customer..."
            className="w-64"
            // onChange={...} // Add filter logic if needed
          />
          {/* Add New Reservation button (optional, can be implemented later) */}
          {/* <Button onClick={() => router.push("/reservations/create")}>Add New Reservation</Button> */}
        </div>
      </div>
      {/* Reservations table */}
      <ReservationsTable />
    </div>
  );
}
