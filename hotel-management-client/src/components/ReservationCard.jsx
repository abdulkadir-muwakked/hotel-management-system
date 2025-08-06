// ReservationCard.jsx
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function ReservationCard({ reservation }) {
  const router = useRouter();
  return (
    <div className="border rounded p-3 bg-muted flex flex-col sm:p-2">
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Badge variant="outline">{reservation.reservationType}</Badge>
        <span className="text-xs text-gray-500">
          {dayjs(reservation.checkIn).format("YYYY-MM-DD")} -{" "}
          {dayjs(reservation.checkOut).format("YYYY-MM-DD")}
        </span>
        <Badge
          variant={reservation.paymentStatus === "paid" ? "default" : "outline"}
        >
          {reservation.paymentStatus}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-1">
        <div className="text-xs text-gray-700">
          <span className="font-medium">Broker:</span>{" "}
          {reservation.broker?.username || "-"}
        </div>
        <div className="text-xs text-gray-700">
          <span className="font-medium">Paid:</span> {reservation.paidAmount}
        </div>
        <div className="text-xs text-gray-700 col-span-2">
          <span className="font-medium">Notes:</span> {reservation.notes || "-"}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 items-center mt-2">
        <span className="text-xs font-medium">Guests:</span>
        {console.log(reservation.customers)}
        {reservation.customers && reservation.customers.length > 0 ? (
          reservation.customers.map((guest, idx) => (
            <Badge
              key={guest.id || guest.email || idx}
              variant="secondary"
              className="mb-1"
            >
              {guest.username || guest.email}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-gray-400">No guests</span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-fit"
        onClick={() => router.push(`/Reservations/${reservation.id}`)}
      >
        View Reservation
      </Button>
    </div>
  );
}
