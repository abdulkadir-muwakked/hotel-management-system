"use client";

import ReservationHeader from "@/components/ui/ReservationHeader";
import { useState } from "react";
import ReservationsTable from "./ReservationsTable";

export default function Reservations() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="p-4 space-y-6">
      <ReservationHeader
        search={search}
        setSearch={setSearch}
        type={type}
        setType={setType}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />
      <ReservationsTable
        search={search}
        type={type}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
}
