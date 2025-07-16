// ReservationHeader.tsx
"use client";

import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { memo } from "react";

function ReservationHeader({
  search,
  setSearch,
  type,
  setType,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onAddReservation,
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center p-2 rounded-md">
      <Input
        type="text"
        placeholder="Search by room, customer, broker..."
        className="w-48"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-48 border rounded-md p-2"
      >
        <option value="">All Types</option>
        <option value="student_male">Student Male</option>
        <option value="student_female">Student Female</option>
        <option value="medical_male">Medical Male</option>
        <option value="medical_female">Medical Female</option>
        <option value="customer">Customer</option>
      </select>
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-36"
      />
      <Input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-36"
      />
      {onAddReservation && (
        <Button onClick={onAddReservation}>Add New Reservation</Button>
      )}
    </div>
  );
}

export default memo(ReservationHeader);
