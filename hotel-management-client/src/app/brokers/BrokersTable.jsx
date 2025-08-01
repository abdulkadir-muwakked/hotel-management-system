"use client";

import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers, useReservations } from "@/contexts/AuthContext";
import dayjs from "dayjs";

export default function BrokersTable() {
  const { users, loading: usersLoading } = useUsers();
  const { reservations, loading: reservationsLoading, error: reservationsError } = useReservations();

  // Filter brokers from users
  const brokers = useMemo(() => (users || []).filter(u => u.role === "broker"), [users]);

  // Map brokerId to reservations
  const brokerReservations = useMemo(() => {
    const map = {};
    (reservations?.data?.reservations || reservations || []).forEach(res => {
      if (res.broker && res.broker.id) {
        if (!map[res.broker.id]) map[res.broker.id] = [];
        map[res.broker.id].push(res);
      }
    });
    return map;
  }, [reservations]);

  if (usersLoading || reservationsLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!brokers.length) {
    return <div className="text-center text-gray-400">No brokers found.</div>;
  }

  return (
    <Table>
      <TableCaption>A list of all brokers and their stats.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Avatar</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Number of Reservations</TableHead>
          <TableHead>Number of Days (All Reservations)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brokers.map((broker) => {
          const reservationsForBroker = brokerReservations[broker.id] || [];
          const numReservations = reservationsForBroker.length;
          const numDays = reservationsForBroker.reduce((sum, res) => {
            const checkIn = dayjs(res.checkIn);
            const checkOut = dayjs(res.checkOut);
            const diff = checkOut.diff(checkIn, "day");
            return sum + (diff > 0 ? diff : 1);
          }, 0);
          return (
            <TableRow key={broker.id}>
              <TableCell className="font-medium">{broker.username}</TableCell>
              <TableCell>
                <Avatar>
                  <AvatarImage src={broker?.avatar?.filePath ? `http://localhost:3000/${broker.avatar.filePath}` : undefined} />
                  <AvatarFallback>{broker.username?.[0] || broker.email?.[0] || "B"}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{broker.phone}</TableCell>
              <TableCell>{numReservations}</TableCell>
              <TableCell>{numDays}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}
