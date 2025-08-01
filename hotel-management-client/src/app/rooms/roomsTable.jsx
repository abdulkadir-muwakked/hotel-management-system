"use client";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);
import { useFilteredRooms } from "@/lib/utils";
import { useRooms } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircleIcon, BadgeCheckIcon, CheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { deleteRoom } from "@/lib/utils";
import { useState } from "react";

export default function RoomsTable() {
  const [type, setType] = useState("");
  const { rooms, loading } = useFilteredRooms({ type });
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (!rooms || rooms.length === 0) {
    return <div className="text-center text-gray-400">No rooms found.</div>;
  }

  // Only show reservations that are current or upcoming (checkOut >= today)
  const today = dayjs().startOf("day");

  // Helper to filter reservations for a room
  const getActiveOrUpcomingReservations = (reservations) =>
    Array.isArray(reservations)
      ? reservations.filter(
          (r) =>
            dayjs(r.checkOut).isSame(today) || dayjs(r.checkOut).isAfter(today)
        )
      : [];

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    setDeletingId(id);
    try {
      await deleteRoom(id);
      window.location.reload(); // Or trigger a context refresh if available
    } catch (err) {
      alert(err.message || "Failed to delete room");
    } finally {
      setDeletingId(null);
    }
  };

  const getBadgeVariant = (type) => {
    switch (type) {
      case "medical_male":
        return "secondary";
      case "medical_female":
        return "destructive";
      case "student_male":
        return "default";
      case "student_female":
        return "destructive";
      case "customer":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2 items-center">
        <Select value={type} onValueChange={setType}>
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="medical">Medical</option>
          <option value="customer">Customer</option>
        </Select>
      </div>
      <Table>
        <TableCaption>A list of your recent rooms.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Number</TableHead>
            <TableHead>Booking Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Broker</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Room Type</TableHead>
            <TableHead className="text-right">actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room, idx) => {
            // Filter reservations for this room
            const activeReservations = getActiveOrUpcomingReservations(
              room.reservations
            );
            return (
              <TableRow
                key={
                  room.id
                    ? `room-${room.id}`
                    : room.roomNumber
                    ? `roomnum-${room.roomNumber}`
                    : `idx-${idx}`
                }
              >
                <TableCell className="font-medium">{room.roomNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex w-full flex-wrap gap-2">
                      {activeReservations.length > 0 ? (
                        activeReservations.map((reservation) => (
                          <Badge
                            key={reservation.id}
                            variant={getBadgeVariant(reservation.reservationType)}
                          >
                            {reservation.reservationType}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-gray-400">
                          No reservations
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {activeReservations.length > 0 &&
                    activeReservations.map((reservation) => {
                      const checkIn = dayjs(reservation.checkIn);
                      const checkOut = dayjs(reservation.checkOut);
                      const diff = checkOut.diff(checkIn, "day");

                      return (
                        <div key={reservation.id} className="mb-2">
                          <div>
                            {checkIn.format("YYYY-MM-DD")} -{" "}
                            {checkOut.format("YYYY-MM-DD")}
                          </div>
                          <div className="text-xs text-gray-500 underline">
                            {diff >= 30
                              ? `${Math.floor(diff / 30)} month(s)`
                              : `${diff} day(s)`}
                          </div>
                        </div>
                      );
                    })}
                </TableCell>
                <TableCell>
                  {(() => {
                    const relevantGuests = activeReservations.flatMap((r) =>
                      [
                        "student_male",
                        "student_female",
                        "medical_male",
                        "medical_female",
                      ].includes(r.reservationType)
                        ? Array.isArray(r.customers)
                          ? r.customers
                          : []
                        : []
                    );

                    if (relevantGuests.length === 0) {
                      return (
                        <Avatar>
                          <AvatarFallback>👤</AvatarFallback>
                        </Avatar>
                      );
                    }

                    const avatarElements = [];
                    for (let i = 0; i < room.capacity; i++) {
                      const guest = relevantGuests[i];
                      let key = `empty-${room.id}-${i}`;
                      if (guest) {
                        key = guest.userId
                          ? `user-${guest.userId}`
                          : guest.id
                          ? `id-${guest.id}`
                          : key;
                      }
                      if (guest && guest.avatar?.filePath) {
                        avatarElements.push(
                          <Avatar key={key}>
                            <AvatarImage
                              src={`http://localhost:3000/${guest.avatar.filePath}`}
                            />
                            <AvatarFallback>👤</AvatarFallback>
                          </Avatar>
                        );
                      } else if (guest) {
                        avatarElements.push(
                          <Avatar key={key}>
                            <AvatarFallback>👤</AvatarFallback>
                          </Avatar>
                        );
                      } else {
                        avatarElements.push(
                          <Avatar key={key}>
                            <AvatarFallback className="bg-gray-200 text-gray-500">
                              –
                            </AvatarFallback>
                          </Avatar>
                        );
                      }
                    }
                    return (
                      <div className="flex -space-x-2">{avatarElements}</div>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  {activeReservations.length > 0 ? (
                    activeReservations.map((reservation) => (
                      <div key={reservation.id}>
                        {reservation.broker?.username}
                      </div>
                    ))
                  ) : (
                    <div>No Broker Assigned</div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Badge
                      variant={
                        room.status === "occupied"
                          ? "destructive"
                          : room.status === "dirty"
                          ? "secondary"
                          : room.status === "clean"
                          ? "success"
                          : "default"
                      }
                      className={
                        room.status === "clean"
                          ? "bg-green-500 text-white"
                          : room.status === "occupied"
                          ? "bg-yellow-500 text-white"
                          : room.status === "dirty"
                          ? "bg-red-500 text-white"
                          : ""
                      }
                    >
                      {room.status
                        ? room.status.charAt(0).toUpperCase() +
                          room.status.slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">
                    {room.type === "student"
                      ? "Student"
                      : room.type === "medical"
                      ? "Medical"
                      : "Customer"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/rooms/${room.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/rooms/${room.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === room.id}
                      onClick={() => handleDelete(room.id)}
                    >
                      {deletingId === room.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow></TableRow>
        </TableFooter>
      </Table>
    </>
  );
}
