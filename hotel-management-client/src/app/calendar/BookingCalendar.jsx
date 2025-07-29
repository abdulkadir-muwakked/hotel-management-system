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
  console.log(rooms, "rooms in BookingCalendar");

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
    if (!rooms) return [];
    // Get all reservations from items mapping
    const allReservations =
      reservations?.data?.reservations || reservations || [];
    return rooms.map((room) => ({
      id: room.id || room._id || room.roomId,
      title: (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {room.roomNumber
            ? `Room ${room.roomNumber}`
            : `Room ${room.id || room._id || room.roomId}`}
          {isRoomEmptyAndDirty(room, allReservations) && (
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ef4444",
                marginLeft: 6,
                boxShadow: "0 0 4px 2px #ef4444",
                border: "2px solid #fff",
                cursor: "help",
              }}
              title="Apartment is empty and dirty"
            />
          )}
        </span>
      ),
    }));
  }, [rooms, reservations]);

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
    // --- FIX: Ensure all rooms are always visible in the calendar ---
    // Create a map of roomId to reservation items
    const items = resList.map((res) => {
      const statusColor = getStatusColor(res);
      const typeColor = getTypeColor(res);
      return {
        id: res.id,
        group: res.roomId,
        title: (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>{getGuestName(res)}</span>
            {typeColor && (
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: typeColor,
                  marginLeft: 4,
                }}
                title={res.reservationType.replace("_", " ")}
              />
            )}
          </span>
        ),
        start_time: dayjs(res.checkIn),
        end_time: dayjs(res.checkOut),
        canMove: canEdit,
        canResize: canEdit ? "both" : false,
        itemProps: {
          style: {
            background: typeColor || statusColor, // Use guest type color as main background if available, else status color
            color: "#fff", // White text for contrast
            borderRadius: 4,
            // Remove borderLeft color tag, use full background color
          },
        },
      };
    });
    // If there are rooms with no reservations, they won't have items.
    // This is fine: react-calendar-timeline will show empty rows for those rooms.
    // --- END FIX ---
    return items;
  }, [reservations, canEdit, search, type, fromDate, toDate, rooms]);

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
    <div ref={timelineRef} style={{ position: "relative" }}>
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
      <div style={{ marginBottom: 16 }}>
        <details
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 12,
            maxWidth: 480,
          }}
        >
          <summary style={{ fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
            Color Legend & Guest Types
          </summary>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Reservation Status Colors
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.checked_in,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Green: Checked In
              </span>
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.not_checked_in,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Blue: Reservation Started, Not Checked In
              </span>
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.checked_out,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Gray: Checked Out
              </span>
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.late_checkout,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Orange: Late Checkout
              </span>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Guest Type Colors
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.medical_female,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Pink: Female Doctor
              </span>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.medical_male,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Dark Blue: Male Doctor
              </span>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.student_male,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Light Blue: Male Student
              </span>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.student_female,
                    width: 18,
                    height: 18,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 6,
                  }}
                />{" "}
                Purple: Female Student
              </span>
            </div>
          </div>
        </details>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {/* Color Legend Box */}
          <div
            style={{
              position: "absolute",
              right: 16,
              bottom: 16,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontSize: 13,
              zIndex: 100,
              minWidth: 220,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Legend</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.checked_in,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Checked In
              </span>
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.not_checked_in,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Reservation Started, Not Checked In
              </span>
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.checked_out,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Checked Out
              </span>
              <span>
                <span
                  style={{
                    background: STATUS_COLORS.late_checkout,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Late Checkout
              </span>
            </div>
            <div style={{ marginTop: 8, fontWeight: 600 }}>Guest Type</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.medical_female,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Female Doctor
              </span>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.medical_male,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Male Doctor
              </span>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.student_male,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Male Student
              </span>
              <span>
                <span
                  style={{
                    background: TYPE_COLORS.student_female,
                    width: 14,
                    height: 14,
                    display: "inline-block",
                    borderRadius: "50%",
                    marginRight: 4,
                  }}
                />{" "}
                Female Student
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  background: "#ef4444",
                  width: 10,
                  height: 10,
                  display: "inline-block",
                  borderRadius: "50%",
                  marginRight: 4,
                }}
              />{" "}
              Apartment Empty & Dirty
            </div>
          </div>
          <Timeline
            groups={groups}
            items={items}
            defaultTimeStart={dayjs().startOf("day")}
            defaultTimeEnd={dayjs().add(9, "day").endOf("day")}
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
                    const updateField =
                      edge === "left" ? "checkIn" : "checkOut";
                    const updateValue = new Date(newTime).toISOString();
                    updateReservation(itemId, { [updateField]: updateValue });
                  }
                : undefined
            }
          />
        </>
      )}
    </div>
  );
};

export default BookingCalendar;

// Constants and helpers
const STATUS_COLORS = {
  checked_in: "#4ade80", // Green
  not_checked_in: "#3b82f6", // Blue
  checked_out: "#d1d5db", // Gray
  late_checkout: "#f97316", // Orange
};
const TYPE_COLORS = {
  medical_female: "#ec4899", // Pink
  medical_male: "#1e293b", // Dark Blue
  student_male: "#38bdf8", // Light Blue
  student_female: "#a78bfa", // Purple
};

// Helper to determine status color
function getStatusColor(res) {
  const now = dayjs();
  const checkIn = dayjs(res.checkIn);
  const checkOut = dayjs(res.checkOut);
  if (res.checkedOut) return STATUS_COLORS.checked_out;
  if (res.checkedIn) return STATUS_COLORS.checked_in;
  if (now.isAfter(checkOut, "day")) return STATUS_COLORS.checked_out;
  if (now.isSame(checkOut, "day") && now.hour() >= 12 && !res.checkedOut)
    return STATUS_COLORS.late_checkout;
  if (now.isAfter(checkIn, "minute") && !res.checkedIn)
    return STATUS_COLORS.not_checked_in;
  return STATUS_COLORS.not_checked_in;
}
// Helper to determine guest type color
function getTypeColor(res) {
  return TYPE_COLORS[res.reservationType] || undefined;
}
// Helper to get guest name(s)
function getGuestName(res) {
  if (res.customers && res.customers.length > 0) {
    return res.customers.map((c) => c.username).join(", ");
  }
  return res.guestName || "Guest";
}
// Helper for apartment row indicator
function isRoomEmptyAndDirty(room, allReservations) {
  // Room is empty if there is no reservation for it in allReservations
  const hasReservation = allReservations.some((r) => r.roomId === room.id);
  return room.status === "dirty" && !hasReservation;
}
