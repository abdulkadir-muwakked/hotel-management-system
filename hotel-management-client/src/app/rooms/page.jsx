"use client";

import RoomsTable from "./roomsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useRooms } from "@/contexts/AuthContext";
import React, { useState } from "react";
import { Select } from "@/components/ui/select";

export default function Rooms() {
  const router = useRouter();
  const { setRoomFilters, roomFilters, loading } = useRooms();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [available, setAvailable] = useState("");

  // Fix: useEffect to update filters when any filter value changes
  React.useEffect(() => {
    setRoomFilters({
      search,
      type,
      minPrice,
      maxPrice,
      available,
    });
    // eslint-disable-next-line
  }, [search, type, minPrice, maxPrice, available]);

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
          <Input
            type="text"
            placeholder="Search by number or description..."
            className="w-48"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select
            value={type}
            onValueChange={val => setType(val)}
          >
            <option value="">All Types</option>
            <option value="student_male">Student Male</option>
            <option value="student_female">Student Female</option>
            <option value="medical_male">Medical Male</option>
            <option value="medical_female">Medical Female</option>
            <option value="customer">Customer</option>
          </Select>
          <Input
            type="number"
            placeholder="Min Price"
            className="w-24"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Price"
            className="w-24"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
          <Select
            value={available}
            onValueChange={val => setAvailable(val)}
          >
            <option value="">All Statuses</option>
            <option value="empty">Empty</option>
            <option value="occupied">Occupied</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </Select>
          <Button
            onClick={() => {
              router.push("rooms/create");
            }}
          >
            Add New Room
          </Button>
        </div>
      </div>
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {/* جدول الغرف */}
      <RoomsTable />
    </div>
  );
}
