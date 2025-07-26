// src/app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllReservations,
  getAllRooms,
  updateReservation,
  updateRoom,
  getAllUsers,
} from "@/lib/utils";
import dayjs from "dayjs";
import PieChartWithLegend from "@/components/ui/PieChartWithLegend";
import BarChartBrokers from "@/components/ui/BarChartBrokers";
import Link from "next/link";

function ReservationList({
  title,
  reservations,
  actionLabel,
  actionField,
  onAction,
  viewLinkField,
}) {
  return (
    <Card className="p-4 flex-1 min-w-[400px]">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Action</TableHead>
            {viewLinkField && <TableHead>View</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={viewLinkField ? 4 : 3}
                className="text-center text-gray-400"
              >
                No reservations
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  {r.customers?.[0]?.username || r.customers?.[0]?.email || "-"}
                </TableCell>
                <TableCell>{r.room?.roomNumber || "-"}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled={!!r[actionField]}
                    onClick={() => onAction(r)}
                  >
                    {!!r[actionField] ? "Marked" : actionLabel}
                  </Button>
                </TableCell>
                {viewLinkField && (
                  <TableCell>
                    <Link href={`/Reservations/${r.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

function RoomStatusTable({ rooms, onToggleClean }) {
  return (
    <Card className="p-4 flex-1 min-w-[400px]">
      <h3 className="text-lg font-semibold mb-2">Empty Rooms</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-400">
                No empty rooms
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.roomNumber}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      room.isClean
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {room.isClean ? "Clean" : "Dirty"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={room.isClean ? "destructive" : "success"}
                    onClick={() => onToggleClean(room)}
                  >
                    {room.isClean ? "Mark as Dirty" : "Mark as Clean"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

export default function DashboardPage() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brokersLookup, setBrokersLookup] = useState({});
  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const resData = await getAllReservations();
        const roomData = await getAllRooms();
        const usersData = await getAllUsers({ role: "broker" });
        const brokersArr = usersData.data?.users || usersData.users || [];
        const brokersMap = {};
        brokersArr.forEach((b) => {
          brokersMap[b.id] = b;
        });
        setBrokersLookup(brokersMap);
        const reservationsRaw =
          resData.data?.reservations || resData.reservations || resData;
        setReservations(reservationsRaw);
        setRooms(roomData.data?.rooms || roomData.rooms || roomData);
        // Debug logs
        console.log("[Dashboard] reservationsRaw:", reservationsRaw);
        console.log(
          "[Dashboard] rooms:",
          roomData.data?.rooms || roomData.rooms || roomData
        );
        console.log("[Dashboard] brokersArr:", brokersArr);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter reservations for today
  const checkIns = reservations.filter(
    (r) => dayjs(r.checkIn).format("YYYY-MM-DD") === today
  );
  const checkOuts = reservations.filter(
    (r) => dayjs(r.checkOut).format("YYYY-MM-DD") === today
  );

  // Empty rooms: no active reservation today
  const emptyRooms = rooms.filter((room) => {
    const hasActive = (room.reservations || []).some((res) => {
      const checkIn = dayjs(res.checkIn).format("YYYY-MM-DD");
      const checkOut = dayjs(res.checkOut).format("YYYY-MM-DD");
      return checkIn <= today && checkOut >= today;
    });
    return !hasActive;
  });

  // حساب بيانات PieChart
  const vacantRooms = rooms.filter((room) => {
    const hasActive = (room.reservations || []).some((res) => {
      const checkIn = dayjs(res.checkIn).format("YYYY-MM-DD");
      const checkOut = dayjs(res.checkOut).format("YYYY-MM-DD");
      return checkIn <= today && checkOut >= today;
    });
    return !hasActive;
  });
  const rentedRooms = rooms.length - vacantRooms.length;
  // تصنيف حسب نوع الحجز
  const studentCount = reservations.filter((r) =>
    r.reservationType?.includes("student")
  ).length;
  const medicalCount = reservations.filter((r) =>
    r.reservationType?.includes("medical")
  ).length;
  const customerCount = reservations.filter(
    (r) => r.reservationType === "customer"
  ).length;
  const pieLabels = ["شقق فاضية", "مستأجرين", "طلاب", "مشفى", "زبائن"];
  const pieData = [
    vacantRooms.length,
    rentedRooms,
    studentCount,
    medicalCount,
    customerCount,
  ];

  // BarChart data: number of customers per broker in last year
  const oneYearAgo = dayjs().subtract(1, "year");
  const brokersCount = {};
  reservations.forEach((r) => {
    const brokerId = r.brokerId || r.broker?.id;
    if (brokerId && r.checkIn && dayjs(r.checkIn).isAfter(oneYearAgo)) {
      const broker = brokersLookup[brokerId];
      const brokerName = broker
        ? broker.username || broker.email
        : `Broker #${brokerId}`;
      brokersCount[brokerName] =
        (brokersCount[brokerName] || 0) + (r.customers?.length || 1);
    }
  });
  const barLabels = Object.keys(brokersCount);
  const barData = Object.values(brokersCount);

  // Action handlers
  const handleCheckIn = async (reservation) => {
    try {
      await updateReservation(reservation.id, { hasCheckedIn: true });
      setReservations((reservations) =>
        reservations.map((r) =>
          r.id === reservation.id ? { ...r, hasCheckedIn: true } : r
        )
      );
    } catch (err) {
      alert("Failed to mark as checked in");
    }
  };
  const handleCheckOut = async (reservation) => {
    try {
      await updateReservation(reservation.id, { hasCheckedOut: true });
      setReservations((reservations) =>
        reservations.map((r) =>
          r.id === reservation.id ? { ...r, hasCheckedOut: true } : r
        )
      );
    } catch (err) {
      alert("Failed to mark as checked out");
    }
  };
  const handleToggleClean = async (room) => {
    try {
      await updateRoom(room.id, { isClean: !room.isClean });
      setRooms((rooms) =>
        rooms.map((r) => (r.id === room.id ? { ...r, isClean: !r.isClean } : r))
      );
    } catch (err) {
      alert("Failed to update room cleanliness");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4">
        <ReservationList
          title="Today's Check-ins"
          reservations={checkIns}
          actionLabel="Mark as Checked In"
          actionField="hasCheckedIn"
          onAction={handleCheckIn}
          viewLinkField={true}
        />
        <ReservationList
          title="Today's Check-outs"
          reservations={checkOuts}
          actionLabel="Mark as Checked Out"
          actionField="hasCheckedOut"
          onAction={handleCheckOut}
          viewLinkField={true}
        />
        <RoomStatusTable rooms={emptyRooms} onToggleClean={handleToggleClean} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PieChartWithLegend
          data={pieData}
          labels={[
            "Vacant Rooms",
            "Rented Rooms",
            "Students",
            "Medical",
            "Customers",
          ]}
          title="Rooms & Customers Statistics"
        />
        <BarChartBrokers
          labels={barLabels}
          data={barData}
          title="Customers per Broker (Last Year)"
          noDataMessage="لا توجد بيانات لعرضها على الرسم البياني"
        />
      </div>
    </div>
  );
}
