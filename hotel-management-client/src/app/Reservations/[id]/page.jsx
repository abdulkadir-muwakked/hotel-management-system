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
import UserViewPage from "@/app/users/[id]/page";
import UserCard from "@/components/UserCard";
import PaymentsSection from "@/components/PaymentsSection";

export default function ViewReservationPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [reservation, setReservation] = useState(null);
  const [payments, setPayments] = useState([]); // Payments state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  console.log("Fetching reservation for reservation:", reservation);

  // Payments state and handler for PaymentsSection
  const handlePaymentsChange = (newPayments) => setPayments(newPayments);

  // Get current user ID from localStorage or context
  let currentUserId = null;
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        currentUserId = JSON.parse(user).id;
      } catch {}
    }
  }

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
        // If payments are part of reservation, set them
        if (found && found.payments) setPayments(found.payments);
        if (!found) setError("Reservation not found");
      } catch (err) {
        setError(err.message || "Failed to fetch reservation");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchReservation();
  }, [id]);

  // Helper to get total price from reservation
  const getTotalPrice = () => {
    if (!reservation) return 0;
    if (typeof reservation.totalPrice === "number")
      return reservation.totalPrice;
    if (typeof reservation.price === "number") return reservation.price;
    if (
      reservation.priceUnit &&
      reservation.price &&
      reservation.checkIn &&
      reservation.checkOut
    ) {
      const checkIn = dayjs(reservation.checkIn);
      const checkOut = dayjs(reservation.checkOut);
      let units = 1;
      if (reservation.priceUnit === "daily") {
        units = checkOut.diff(checkIn, "day");
      } else if (reservation.priceUnit === "monthly") {
        units = checkOut.diff(checkIn, "month");
      }
      if (units < 1) units = 1;
      return units * Number(reservation.price);
    }
    return 0;
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!reservation) return null;

  return (
    <div className="flex gap-4">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Reservation Details</h1>
        <div className="space-y-2 border rounded p-4 bg-muted">
          <div>
            <span className="font-semibold">Room:</span> {reservation.roomId}
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
            <span className="font-semibold">Type:</span>{" "}
            <Badge>
              {reservation.reservationType === "student_male"
                ? "Student (Male)"
                : reservation.reservationType === "student_female"
                ? "Student (Female)"
                : reservation.reservationType === "medical_male"
                ? "Medical (Male)"
                : reservation.reservationType === "medical_female"
                ? "Medical (Female)"
                : "Customer"}
            </Badge>
          </div>
          {/* Show university field for student types */}
          {(reservation.reservationType === "student_male" ||
            reservation.reservationType === "student_female") && (
            <div>
              <span className="font-semibold">University:</span>{" "}
              {reservation.customerDetails?.university || "-"}
            </div>
          )}
          {/* Show hospital field for medical types */}
          {(reservation.reservationType === "medical_male" ||
            reservation.reservationType === "medical_female") && (
            <div>
              <span className="font-semibold">Hospital:</span>{" "}
              {reservation.customerDetails?.hospital || "-"}
            </div>
          )}
          <div>
            <span className="font-semibold">Price:</span> {reservation.price}
          </div>
          <div>
            <span className="font-semibold">Price Unit:</span>{" "}
            {reservation.priceUnit === "daily"
              ? "Day"
              : reservation.priceUnit === "monthly"
              ? "Month"
              : reservation.priceUnit === "seasonal"
              ? "Seasonal"
              : reservation.priceUnit}
          </div>
          {reservation.broker && (
            <div>
              <span className="font-semibold">Broker Commission Percent:</span>{" "}
              {reservation.brokerCommissionPercent ?? "-"}
            </div>
          )}
          {reservation.broker && (
            <div>
              <span className="font-semibold">Broker Commission Amount:</span>{" "}
              {reservation.brokerCommissionAmount ?? "-"}
            </div>
          )}
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
        {console.log("Reservation Customers:", reservation.customers)}
      </div>
      <div>
        {/* Show user info for the first customer if available */}
        {reservation.customers && reservation.customers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Customer Info</h2>
            <UserViewPage user={reservation.customers[0]} />
          </div>
        )}
        {console.log("reservation.customers[0]", reservation.customers[0])}
      </div>
      <div>
        <PaymentsSection
          payments={payments}
          onPaymentsChange={handlePaymentsChange}
          reservationId={id}
          receivedBy={currentUserId}
          totalPrice={getTotalPrice()} // <-- Pass total price to PaymentsSection
        />
      </div>
    </div>
  );
}
