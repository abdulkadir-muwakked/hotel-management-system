"use client";

import { useReservations } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { deleteReservation } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

export default function ReservationsTable({
  search = "",
  type = "",
  fromDate = "",
  toDate = "",
}) {
  const { reservations, loading, error, fetchReservations } = useReservations();
  const router = useRouter();

  let filtered = reservations?.data?.reservations || reservations || [];
  console.log("Filtered Reservations:", filtered);

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (res) =>
        (res.roomNumber && res.roomNumber.toString().includes(s)) ||
        (res.reservationType &&
          res.reservationType.toLowerCase().includes(s)) ||
        (res.customers &&
          res.customers.some((c) => c.username?.toLowerCase().includes(s))) ||
        (res.broker && res.broker.username?.toLowerCase().includes(s))
    );
  }
  if (type) {
    filtered = filtered.filter((res) => res.reservationType === type);
  }
  if (fromDate) {
    filtered = filtered.filter((res) => {
      const checkIn = dayjs(res.checkIn);
      const from = dayjs(fromDate);
      return checkIn.valueOf() >= from.valueOf();
    });
  }
  if (toDate) {
    filtered = filtered.filter((res) => {
      const checkOut = dayjs(res.checkOut);
      const to = dayjs(toDate);
      return checkOut.valueOf() <= to.valueOf();
    });
  }

  return (
    <Table>
      <TableCaption>A list of all reservations.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Room</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Customers</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={9}>Loading...</TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={9} className="text-red-500">
              {error}
            </TableCell>
          </TableRow>
        ) : (
          filtered.map((res) => (
            <TableRow key={res.id}>
              <TableCell>{res.roomId}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    res.reservationType === "medical_male"
                      ? "secondary"
                      : res.reservationType === "medical_female"
                      ? "destructive"
                      : res.reservationType === "student_male"
                      ? "default"
                      : res.reservationType === "student_female"
                      ? "destructive"
                      : res.reservationType === "customer"
                      ? "outline"
                      : "outline"
                  }
                >
                  {res.reservationType}
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  {(() => {
                    const checkIn = dayjs(res.checkIn);
                    const checkOut = dayjs(res.checkOut);
                    const diff = checkOut.diff(checkIn, "day");
                    return (
                      <>
                        <div>
                          {checkIn.format("YYYY-MM-DD")} -{" "}
                          {checkOut.format("YYYY-MM-DD")}
                        </div>
                        <div className="text-xs text-gray-500 underline">
                          {diff >= 30
                            ? `${Math.floor(diff / 30)} month(s)`
                            : `${diff} day(s)`}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </TableCell>

              <TableCell>{res.paidAmount}</TableCell>
              <TableCell>{res.paymentStatus}</TableCell>
              <TableCell>
                {res.customers && res.customers.length > 0
                  ? res.customers.map((c) => c.username).join(", ")
                  : "-"}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/Reservations/${res.id}`)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="ml-2"
                  onClick={() => router.push(`/Reservations/${res.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-2"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this reservation?"
                      )
                    ) {
                      try {
                        await deleteReservation(res.id);
                        if (typeof fetchReservations === "function") {
                          fetchReservations();
                        } else {
                          window.location.reload();
                        }
                      } catch (err) {
                        alert(err.message || "Failed to delete reservation");
                      }
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
      <TableFooter></TableFooter>
    </Table>
  );
}
