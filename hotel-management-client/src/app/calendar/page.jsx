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
      <BookingCalendar
        search={search}
        type={type}
        fromDate={fromDate}
        toDate={toDate}
      />
    </div>
  );
}
