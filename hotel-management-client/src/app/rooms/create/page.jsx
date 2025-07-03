"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createRoom } from "@/lib/utils";
import { useRooms } from "@/contexts/AuthContext";

export default function AddRoom() {
  const router = useRouter();
  const { addRoom } = useRooms();
  const [form, setForm] = useState({
    roomNumber: "",
    capacity: "",
    price: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const newRoom = await createRoom({
        ...form,
        capacity: Number(form.capacity),
        price: Number(form.price),
      });
      addRoom(newRoom);

      router.push("/rooms"); // بعد النجاح بيرجعك لصفحة الغرف
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Room</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="roomNumber"
          placeholder="Room Number"
          value={form.roomNumber}
          onChange={handleChange}
          required
        />
        <Input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          required
        />
        <Input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <Textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Room"}
        </Button>
      </form>
    </div>
  );
}
