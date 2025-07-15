"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRoomById, updateRoom } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const handleChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateRoom(roomId, room);
      router.push("/rooms");
    } catch (err) {
      setError(err.message || "Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!room) return <div>Room not found</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Room</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              value={room.roomNumber || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              value={room.capacity || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={room.price || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={room.description || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={room.status || ""}
              onChange={(e) => setRoom({ ...room, status: e.target.value })}
              className="w-full border rounded px-2 py-1"
              required
            >
              <option value="">Select status</option>
              {/* <option value="occupied">Occupied</option> */}
              <option value="clean">Clean</option>
              <option value="dirty">Dirty</option>
            </select>
          </div>
          {/* Show reservations info (read-only) */}
          <div>
            <h3 className="font-semibold mb-1">Reservations</h3>
            {room.reservations && room.reservations.length > 0 ? (
              <div className="space-y-2">
                {room.reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border rounded p-2 bg-muted"
                  >
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <Badge variant="outline">
                        {reservation.reservationType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {reservation.checkIn} - {reservation.checkOut}
                      </span>
                      <Badge
                        variant={
                          reservation.paymentStatus === "paid"
                            ? "default"
                            : "outline"
                        }
                      >
                        {reservation.paymentStatus}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-700 mb-1">
                      Broker: {reservation.broker?.username || "-"}
                    </div>
                    <div className="text-xs text-gray-700 mb-1">
                      Paid: {reservation.paidAmount}
                    </div>
                    <div className="text-xs text-gray-700 mb-1">
                      Notes: {reservation.notes || "-"}
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="text-xs font-medium">Guests:</span>
                      {reservation.customers &&
                      reservation.customers.length > 0 ? (
                        reservation.customers.map((guest, idx) => (
                          <Badge
                            key={guest.id || guest.email || idx}
                            variant="secondary"
                          >
                            {guest.username || guest.email}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No guests</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400">No reservations</div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/rooms")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
