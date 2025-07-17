"use client";

import ReservationHeader from "@/components/ui/ReservationHeader";
import { useState } from "react";
import ReservationsTable from "./ReservationsTable";

export default function Reservations() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const onAddReservation = () => {
    router.push("/Reservations/create"); // or open a modal, etc.
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reservations Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all rooms and their reservations.
          </p>
        </div>
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

      <ReservationsTable
        search={search}
        type={type}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
}
