"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoomById } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import ReservationCard from "@/components/ReservationCard";

export default function RoomViewPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for toggling past and future reservations
  const [showPast, setShowPast] = useState(false);
  const [showFuture, setShowFuture] = useState(false);

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

  // Find current, past, and future reservations
  const today = dayjs().startOf("day");
  const reservations = room.reservations || [];
  const currentReservation = reservations.find(
    (r) =>
      dayjs(r.checkIn).startOf("day") <= today &&
      dayjs(r.checkOut).endOf("day") >= today
  );
  const pastReservations = reservations.filter(
    (r) => dayjs(r.checkOut).endOf("day") < today
  );
  const futureReservations = reservations.filter(
    (r) => dayjs(r.checkIn).startOf("day") > today
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 sm:px-4 w-full">
      <Card className="p-8 sm:p-4">
        <h2 className="text-3xl font-bold mb-4 sm:text-2xl">
          Room #{room.roomNumber || room.number}
        </h2>
        <div className="mb-4 flex gap-3 flex-wrap sm:gap-2">
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
        <div className="mb-4 text-gray-700 text-base sm:text-sm">
          Description: {room.description || "-"}
        </div>
        <div className="mb-4 text-gray-700 text-base sm:text-sm">
          State: {room.state || "-"}
        </div>

        {/* Current Reservation */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-lg sm:text-base">
            Current Reservation
          </h3>
          {currentReservation ? (
            <ReservationCard reservation={currentReservation} />
          ) : (
            <div className="text-xs text-gray-400 mb-2">
              No current reservation
            </div>
          )}
        </div>

        {/* Past Reservations */}
        <div className="mb-6">
          <button
            type="button"
            className="flex items-center gap-2 mb-2 text-base font-semibold focus:outline-none"
            onClick={() => setShowPast((v) => !v)}
            aria-expanded={showPast}
          >
            Past Reservations
            <span
              className={`transition-transform ${
                showPast ? "" : "rotate-180"
              } text-gray-400`}
            >
              ▼
            </span>
          </button>
          {showPast &&
            (pastReservations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pastReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400">No past reservations</div>
            ))}
        </div>
        {/* Future Reservations */}
        <div className="mb-6">
          <button
            type="button"
            className="flex items-center gap-2 mb-2 text-base font-semibold focus:outline-none"
            onClick={() => setShowFuture((v) => !v)}
            aria-expanded={showFuture}
          >
            Future Reservations
            <span
              className={`transition-transform ${
                showFuture ? "" : "rotate-180"
              } text-gray-400`}
            >
              ▼
            </span>
          </button>
          {showFuture &&
            (futureReservations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {futureReservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400">
                No future reservations
              </div>
            ))}
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto mt-2"
          onClick={() => router.push("/rooms")}
        >
          Back to Rooms
        </Button>
      </Card>
    </div>
  );
}
