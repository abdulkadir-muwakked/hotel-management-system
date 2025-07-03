"use client";

import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import { useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { useAuth, useReservations, useRooms } from "@/contexts/AuthContext";
import { updateReservation as apiUpdateReservation } from "@/lib/utils";

const BookingCalendar = () => {
  const { user } = useAuth();
  const { reservations, loading, error, fetchReservations } = useReservations();
  const { rooms } = useRooms();

  // Only allow drag/resize for admin or receptionist
  const canEdit = user && ["admin", "receptionist"].includes(user.role);

  const updateReservation = useCallback(
    async (id, updates) => {
      try {
        await apiUpdateReservation(id, updates);
        fetchReservations(); // Refresh data
      } catch (err) {
        // Optionally show a toast or error
        console.error("Failed to update reservation", err);
      }
    },
    [fetchReservations]
  );

  // Prepare data for react-calendar-timeline
  // Map rooms and reservations to timeline groups and items
  const groups = useMemo(() => {
    // Use all rooms, even if no reservations
    if (!rooms) return [];
    return rooms.map((room) => ({
      id: room.id || room._id || room.roomId,
      title: room.name
        ? room.name
        : `Room ${room.id || room._id || room.roomId}`,
    }));
  }, [rooms]);

  const items = useMemo(() => {
    const resList = reservations?.data?.reservations || reservations || [];
    return resList.map((res) => ({
      id: res.id,
      group: res.roomId,
      title: `${res.reservationType} (${res.paidAmount})`,
      start_time: dayjs(res.checkIn),
      end_time: dayjs(res.checkOut),
      canMove: canEdit,
      canResize: canEdit ? "both" : false,
      itemProps: {
        style: {
          background:
            res.paymentStatus === "pending"
              ? "#facc15"
              : res.paymentStatus === "blocked"
              ? "#f87171"
              : "#4ade80",
          color: "#222",
          borderRadius: 4,
        },
      },
    }));
  }, [reservations, canEdit]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Booking Calendar</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={dayjs().startOf("month")}
          defaultTimeEnd={dayjs().endOf("month")}
          sidebarWidth={200}
          lineHeight={48}
          itemHeightRatio={0.75}
          onItemMove={
            canEdit
              ? (itemId, dragTime, newGroupOrder) => {
                  const updatedCheckIn = new Date(dragTime).toISOString();
                  const newRoomId = groups[newGroupOrder]?.id;
                  updateReservation(itemId, {
                    checkIn: updatedCheckIn,
                    roomId: newRoomId,
                  });
                }
              : undefined
          }
          onItemResize={
            canEdit
              ? (itemId, newTime, edge) => {
                  const updateField = edge === "left" ? "checkIn" : "checkOut";
                  const updateValue = new Date(newTime).toISOString();
                  updateReservation(itemId, { [updateField]: updateValue });
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default BookingCalendar;
