"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoomById } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

export default function RoomViewPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRoom() {
      setLoading(true);
      try {
        const found = await getRoomById(roomId);
        setRoom(found);
      } catch (err) {
        setError("Failed to load room");
      } finally {
        setLoading(false);
      }
    }
    if (roomId) fetchRoom();
  }, [roomId]);

  if (loading) return <div>Loading...</div>;
  if (!room) return <div>Room not found</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">
          Room #{room.roomNumber || room.number}
        </h2>
        <div className="mb-2 flex gap-2">
          <Badge>Capacity: {room.capacity}</Badge>
          <Badge>Price: {room.price}</Badge>
          <Badge variant="default">
            {room.type === "student"
              ? "Student"
              : room.type === "medical"
              ? "Medical"
              : "Customer"}
          </Badge>
        </div>
        <div className="mb-2 text-gray-700">
          Description: {room.description || "-"}
        </div>
        <div className="mb-2 text-gray-700">State: {room.state || "-"}</div>
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Reservations</h3>
          {room.reservations && room.reservations.length > 0 ? (
            <div className="space-y-2">
              {room.reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border rounded p-2 bg-muted"
                >
                  <div className="flex flex-wrap gap-2 items-center mb-1">
                    <Badge variant="outline">
                      {reservation.reservationType}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {dayjs(reservation.checkIn).format("YYYY-MM-DD")} -{" "}
                      {dayjs(reservation.checkOut).format("YYYY-MM-DD")}
                    </span>
                    <Badge
                      variant={
                        reservation.paymentStatus === "paid"
                          ? "default"
                          : "outline"
                      }
                    >
                      {reservation.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-700 mb-1">
                    Broker: {reservation.broker?.username || "-"}
                  </div>
                  <div className="text-xs text-gray-700 mb-1">
                    Paid: {reservation.paidAmount}
                  </div>
                  <div className="text-xs text-gray-700 mb-1">
                    Notes: {reservation.notes || "-"}
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-xs font-medium">Guests:</span>
                    {reservation.customers &&
                    reservation.customers.length > 0 ? (
                      reservation.customers.map((guest) => (
                        <Badge key={guest.id} variant="secondary">
                          {guest.username || guest.email}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No guests</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400">No reservations</div>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push("/rooms")}>
          Back to Rooms
        </Button>
      </Card>
    </div>
  );
}
