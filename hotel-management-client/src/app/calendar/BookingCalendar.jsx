"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useAuth, useReservations } from "@/contexts/AuthContext";
import { updateReservation as apiUpdateReservation } from "@/lib/utils";
import { useFilteredRooms } from "@/lib/utils";
import { DataSet, Timeline as VisTimeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import { Select } from "@/components/ui/select";

const ZOOM_LEVELS = [
  { label: "Week", value: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "Month", value: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { label: "3 Months", value: "3months", ms: 90 * 24 * 60 * 60 * 1000 },
  { label: "6 Months", value: "6months", ms: 180 * 24 * 60 * 60 * 1000 },
  { label: "Year", value: "year", ms: 365 * 24 * 60 * 60 * 1000 },
];

const BookingCalendar = ({
  search = "",
  type: initialType = "",
  fromDate = "",
  toDate = "",
  locale = "en", // Optionally pass locale
}) => {
  const [type, setType] = useState(initialType);
  const { user } = useAuth();
  const { reservations, loading, error, fetchReservations } = useReservations();
  const { rooms } = useFilteredRooms(type ? { type } : {});
  const canEdit = user && ["admin", "receptionist"].includes(user.role);
  const timelineDivRef = useRef(null);
  const timelineInstance = useRef(null);

  const updateReservation = useCallback(
    async (id, updates) => {
      try {
        await apiUpdateReservation(id, updates);
        fetchReservations();
      } catch (err) {
        console.error("Failed to update reservation", err);
      }
    },
    [fetchReservations]
  );

  // Prepare groups (rooms)
  const groups = useMemo(() => {
    if (!rooms) return [];
    return rooms.map((room) => ({
      id: String(room.id || room._id || room.roomId),
      content: room.roomNumber
        ? `Room ${room.roomNumber}`
        : `Room ${room.id || room._id || room.roomId}`,
    }));
  }, [rooms]);

  // Prepare items (reservations)
  const items = useMemo(() => {
    let resList = reservations?.data?.reservations || reservations || [];
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
        return (
          checkIn.startOf("day").valueOf() >= from.startOf("day").valueOf()
        );
      });
    }
    if (toDate) {
      resList = resList.filter((res) => {
        const checkOut = dayjs(res.checkOut);
        const to = dayjs(toDate);
        return checkOut.endOf("day").valueOf() <= to.endOf("day").valueOf();
      });
    }
    // Only include reservations whose roomId matches a room in the current rooms list
    const roomIds = new Set((rooms || []).map(r => String(r.id || r._id || r.roomId)));
    resList = resList.filter(res => roomIds.has(String(res.roomId)));
    return resList.map((res) => ({
      id: String(res.id),
      group: String(res.roomId),
      content: getGuestName(res),
      start: res.checkIn,
      end: res.checkOut,
      style: `background:${
        getTypeColor(res) || getStatusColor(res)
      };border:1px solid ${
        getTypeColor(res) || getStatusColor(res)
      };color:#fff;`,
      editable: !!canEdit,
      ...res,
    }));
  }, [reservations, canEdit, search, type, fromDate, toDate, rooms]);

  const [zoom, setZoom] = useState("week");
  const [timelineRange, setTimelineRange] = useState({
    start: null,
    end: null,
  });

  // Set initial range (center on today, 6 months before/after)
  useEffect(() => {
    const today = dayjs().startOf("day");
    setTimelineRange({
      start: today.subtract(6, "month").toDate(),
      end: today.add(6, "month").toDate(),
    });
  }, []);

  // Handle zoom change
  useEffect(() => {
    const today = dayjs().startOf("day");
    const zoomObj = ZOOM_LEVELS.find((z) => z.value === zoom) || ZOOM_LEVELS[4];
    const half = zoomObj.ms / 2;
    setTimelineRange({
      start: new Date(today.valueOf() - half),
      end: new Date(today.valueOf() + half),
    });
    // Center timeline on today
    if (timelineInstance.current) {
      timelineInstance.current.setWindow(
        new Date(today.valueOf() - half),
        new Date(today.valueOf() + half),
        { animation: true }
      );
      timelineInstance.current.moveTo(today.toDate(), { animation: true });
    }
  }, [zoom]);

  // Handle item move/resize
  const handleItemMove = (itemId, group, start, end) => {
    if (!canEdit) return;
    updateReservation(itemId, {
      checkIn: start.toISOString(),
      checkOut: end.toISOString(),
      roomId: group,
    });
  };

  // Timeline options
  const options = useMemo(() => {
    // Enable stacking for student/medical, disable for others
    const isStacked =
      type === "student" || type === "medical" || type === "";
    const opts = {
      stack: isStacked, // <-- key change
      orientation: { axis: "top", item: "bottom" },
      min: dayjs().subtract(10, "year").toDate(),
      max: dayjs().add(10, "year").toDate(),
      zoomMin: 24 * 60 * 60 * 1000, // 1 day
      zoomMax: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
      moveable: true,
      zoomable: true, // allow zoom in/out with mouse/touch
      horizontalScroll: true,
      verticalScroll: true,
      editable: !!canEdit,
      showCurrentTime: true,
      showMajorLabels: true,
      showMinorLabels: true,
      height: "100%",
    };
    if (timelineRange.start instanceof Date && !isNaN(timelineRange.start)) {
      opts.start = timelineRange.start;
    }
    if (timelineRange.end instanceof Date && !isNaN(timelineRange.end)) {
      opts.end = timelineRange.end;
    }
    return opts;
  }, [timelineRange, canEdit, type]);

  // دالة لتغيير الزوم يدويًا
  const handleZoomButton = useCallback((zoomValue) => {
    setZoom(zoomValue);
    if (timelineInstance.current) {
      const today = dayjs().startOf("day");
      const zoomObj =
        ZOOM_LEVELS.find((z) => z.value === zoomValue) || ZOOM_LEVELS[4];
      const half = zoomObj.ms / 2;
      timelineInstance.current.setWindow(
        new Date(today.valueOf() - half),
        new Date(today.valueOf() + half),
        { animation: true }
      );
      timelineInstance.current.moveTo(today.toDate(), { animation: true });
    }
  }, []);

  // Create/Update timeline instance
  useEffect(() => {
    if (!timelineDivRef.current) return;
    // Destroy previous instance
    if (
      timelineInstance.current &&
      typeof timelineInstance.current.destroy === "function"
    ) {
      try {
        timelineInstance.current.destroy();
      } catch (e) {
        // Ignore errors from double-destroy or already-destroyed instance
        console.warn("Timeline destroy error (safe to ignore):", e);
      }
      timelineInstance.current = null;
    }
    // Create new instance
    const groupsDS = new DataSet(groups);
    const itemsDS = new DataSet(items);
    timelineInstance.current = new VisTimeline(
      timelineDivRef.current,
      itemsDS,
      groupsDS,
      options
    );
    // Handle move/resize
    timelineInstance.current.on("move", function (event) {
      if (!canEdit) return;
      const { item, start, end, group } = event;
      handleItemMove(item, group, dayjs(start), dayjs(end));
    });
    timelineInstance.current.on("update", function (event) {
      if (!canEdit) return;
      const { item, start, end, group } = event;
      handleItemMove(item, group, dayjs(start), dayjs(end));
    });
    // Center on today
    const today = dayjs().startOf("day");
    const zoomObj = ZOOM_LEVELS.find((z) => z.value === zoom) || ZOOM_LEVELS[4];
    const half = zoomObj.ms / 2;
    timelineInstance.current.setWindow(
      new Date(today.valueOf() - half),
      new Date(today.valueOf() + half),
      { animation: true }
    );
    timelineInstance.current.moveTo(today.toDate(), { animation: true });
    return () => {
      if (
        timelineInstance.current &&
        typeof timelineInstance.current.destroy === "function"
      ) {
        try {
          timelineInstance.current.destroy();
        } catch (e) {
          // Ignore errors from double-destroy or already-destroyed instance
          console.warn("Timeline destroy error (safe to ignore):", e);
        }
        timelineInstance.current = null;
      }
    };
  }, [groups, items, options, zoom, canEdit]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "#fff",
        margin: 0,
        padding: 0,
        flex: 1,
      }}
    >
      <h2 className="text-2xl font-semibold mb-4" style={{ marginTop: 0 }}>
        Booking Calendar
      </h2>
      <div className="mb-4 flex gap-2 items-center">
        <Select value={type} onValueChange={setType}>
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="medical">Medical</option>
          <option value="customer">Customer</option>
        </Select>
      </div>
      {/* User instructions */}
      <div style={{ marginBottom: 8, color: "#666", fontSize: 14 }}>
        Use the zoom buttons to control the timeline. To scroll horizontally,
        drag the timeline left or right with your mouse or touch.
      </div>
      {/* Zoom controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {ZOOM_LEVELS.map((z) => (
          <button
            key={z.value}
            onClick={() => handleZoomButton(z.value)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              border: z.value === zoom ? "2px solid #3b82f6" : "1px solid #ccc",
              background: z.value === zoom ? "#e0e7ff" : "#fff",
              fontWeight: z.value === zoom ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {z.label}
          </button>
        ))}
      </div>
      {/* Scroll controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => {
            if (timelineInstance.current) {
              const range = timelineInstance.current.getWindow();
              const diff = (range.end - range.start) * 0.5;
              timelineInstance.current.setWindow(
                new Date(range.start - diff),
                new Date(range.end - diff),
                { animation: true }
              );
            }
          }}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#fff",
            fontWeight: 400,
            cursor: "pointer",
          }}
        >
          ◀ Previous
        </button>
        <button
          onClick={() => {
            if (timelineInstance.current) {
              const range = timelineInstance.current.getWindow();
              const diff = (range.end - range.start) * 0.5;
              timelineInstance.current.setWindow(
                new Date(range.start + diff),
                new Date(range.end + diff),
                { animation: true }
              );
            }
          }}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#fff",
            fontWeight: 400,
            cursor: "pointer",
          }}
        >
          Next ▶
        </button>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          height: "100%",
          width: "100%",
          margin: 0,
          padding: 0,
        }}
      >
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : groups.length === 0 ? (
          <div className="text-gray-500">
            No rooms available to display on the timeline.
          </div>
        ) : (
          // Always show the timeline if there are rooms, even if items.length === 0
          <div
            ref={timelineDivRef}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 500,
              minWidth: 300,
              overflow: "auto",
              background: "#fff",
            }}
          />
        )}
      </div>
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
