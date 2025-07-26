"use client";

import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import { useMemo, useCallback, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { useAuth, useReservations, useRooms } from "@/contexts/AuthContext";
import { updateReservation as apiUpdateReservation } from "@/lib/utils";

const BookingCalendar = ({
  search = "",
  type = "",
  fromDate = "",
  toDate = "",
}) => {
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
    let resList = reservations?.data?.reservations || reservations || [];
    // Filter by search, type, date
    if (search) {
      const s = search.toLowerCase();
      resList = resList.filter(
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
      resList = resList.filter((res) => res.reservationType === type);
    }
    if (fromDate) {
      resList = resList.filter((res) => {
        const checkIn = dayjs(res.checkIn);
        const from = dayjs(fromDate);
        // Use startOf('day') for both to avoid time issues
        return (
          checkIn.startOf("day").valueOf() >= from.startOf("day").valueOf()
        );
      });
    }
    if (toDate) {
      resList = resList.filter((res) => {
        const checkOut = dayjs(res.checkOut);
        const to = dayjs(toDate);
        // Use endOf('day') for both to avoid time issues
        return checkOut.endOf("day").valueOf() <= to.endOf("day").valueOf();
      });
    }
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
  }, [reservations, canEdit, search, type, fromDate, toDate]);

  // --- Sticky header/scroll sync fix ---
  const timelineRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    // Wait for DOM to render
    const interval = setInterval(() => {
      // Find the main scrollable timeline area and header
      const timeline = timelineRef.current?.querySelector(".rct-scroll");
      const header = timelineRef.current?.querySelector(".rct-header-root");
      if (timeline && header) {
        headerRef.current = header;
        // Sync header scrollLeft with timeline
        const onScroll = () => {
          header.scrollLeft = timeline.scrollLeft;
        };
        timeline.addEventListener("scroll", onScroll);
        // Clean up
        return () => {
          timeline.removeEventListener("scroll", onScroll);
        };
      }
    }, 100);
    // Clean up interval after 2s (enough for DOM to mount)
    setTimeout(() => clearInterval(interval), 2000);
    return () => clearInterval(interval);
  }, []);
  // --- End sticky header/scroll sync fix ---

  return (
    <div ref={timelineRef}>
      <style>{`
        /* Make the timeline header sticky */
        .rct-header-root {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fff;
        }
        /* Make the sidebar (room names) sticky */
        .rct-sidebar {
          position: sticky;
          left: 0;
          z-index: 11;
          background: #fff;
          box-shadow: 2px 0 4px rgba(0,0,0,0.03);
        }
        /* Optional: keep sidebar header sticky too */
        .rct-sidebar .rct-sidebar-row.rct-sidebar-header {
          position: sticky;
          top: 0;
          z-index: 12;
          background: #fff;
        }
      `}</style>
      <h2 className="text-2xl font-semibold mb-4">Booking Calendar</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Timeline
          groups={groups}
          items={items}
          defaultTimeStart={dayjs().startOf("day")}
          defaultTimeEnd={dayjs().add(7, "day").endOf("day")}
          timeSteps={{
            second: 0,
            minute: 0,
            hour: 0,
            day: 1,
            month: 1,
            year: 1,
          }}
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
