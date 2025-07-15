// Reservation details page
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAllRooms,
  getAllUsers,
  getAllUsers as getBrokers,
  getAllReservations,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";

export default function ViewReservationPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReservation() {
      setLoading(true);
      setError("");
      try {
        // You may want to create a getReservationById util, but for now use getAllReservations
        const all = await getAllReservations();
        const found = (all.data?.reservations || all).find(
          (r) => String(r.id) === String(id)
        );
        setReservation(found || null);
        if (!found) setError("Reservation not found");
      } catch (err) {
        setError(err.message || "Failed to fetch reservation");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchReservation();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!reservation) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reservation Details</h1>
      <div className="space-y-2 border rounded p-4 bg-muted">
        <div>
          <span className="font-semibold">Room:</span> {reservation.roomId}
        </div>
        <div>
          <span className="font-semibold">Type:</span>{" "}
          <Badge>{reservation.reservationType}</Badge>
        </div>
        <div>
          <span className="font-semibold">Check-in:</span>{" "}
          {dayjs(reservation.checkIn).format("YYYY-MM-DD")}
        </div>
        <div>
          <span className="font-semibold">Check-out:</span>{" "}
          {dayjs(reservation.checkOut).format("YYYY-MM-DD")}
        </div>
        <div>
          <span className="font-semibold">Paid Amount:</span>{" "}
          {reservation.paidAmount}
        </div>
        <div>
          <span className="font-semibold">Payment Status:</span>{" "}
          <Badge
            variant={
              reservation.paymentStatus === "paid" ? "default" : "outline"
            }
          >
            {reservation.paymentStatus}
          </Badge>
        </div>
        <div>
          <span className="font-semibold">Notes:</span>{" "}
          {reservation.notes || "-"}
        </div>
        <div>
          <span className="font-semibold">Customers:</span>{" "}
          {reservation.customers && reservation.customers.length > 0
            ? reservation.customers.map((c) => c.username).join(", ")
            : "-"}
        </div>
        <div>
          <span className="font-semibold">Broker:</span>{" "}
          {reservation.broker?.username || "-"}
        </div>
        <div>
          <span className="font-semibold">Created At:</span>{" "}
          {dayjs(reservation.createdAt).format("YYYY-MM-DD HH:mm")}
        </div>
        <div>
          <span className="font-semibold">Updated At:</span>{" "}
          {dayjs(reservation.updatedAt).format("YYYY-MM-DD HH:mm")}
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    </div>
  );
}
