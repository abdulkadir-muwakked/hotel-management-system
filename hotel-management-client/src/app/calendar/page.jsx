// Reservations.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BookingCalendar from "./BookingCalendar";
import ReservationHeader from "@/components/ui/ReservationHeader";

export default function Reservations() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Example: Implement onAddReservation
  const onAddReservation = () => {
    router.push("/reservations/new"); // or open a modal, etc.
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Reservations Management</h2>
        <p className="text-sm text-muted-foreground">
          View and manage all rooms and their reservations.
        </p>

        <ReservationHeader
          search={search}
          setSearch={setSearch}
          type={type}
          setType={setType}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          onAddReservation={onAddReservation}
        />
      </div>
      <BookingCalendar
        search={search}
        type={type}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
}
