// Reservation edit page
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAllRooms,
  getAllUsers,
  getAllUsers as getBrokers,
  getAllReservations,
  updateReservation,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { CustomerSearch } from "../../create/page";

function CreateCustomerForm({ initialName, onCreated }) {
  const [form, setForm] = useState({
    username: initialName || "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await createUser(form);
      onCreated(user.data.user || user.user || user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      className="space-y-2 border rounded p-3 bg-muted"
      onSubmit={handleSubmit}
    >
      <div className="font-semibold">Create New Customer</div>
      <Input
        name="username"
        placeholder="Name"
        value={form.username}
        onChange={handleChange}
        required
      />
      <Input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        required
      />
      <Input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create & Select"}
      </Button>
    </form>
  );
}

export default function EditReservationPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [reservation, setReservation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const all = await getAllReservations();
        const found = (all.data?.reservations || all).find(
          (r) => String(r.id) === String(id)
        );
        setReservation(found || null);
        setForm(
          found
            ? {
                roomId: found.roomId || "",
                brokerId: found.brokerId || "",
                reservationType: found.reservationType || "",
                checkIn: found.checkIn
                  ? dayjs(found.checkIn).format("YYYY-MM-DD")
                  : "",
                checkOut: found.checkOut
                  ? dayjs(found.checkOut).format("YYYY-MM-DD")
                  : "",
                paidAmount: found.paidAmount || "",
                paymentStatus: found.paymentStatus || "pending",
                notes: found.notes || "",
              }
            : null
        );
        setSelectedCustomer(found?.customers?.[0] || null);
        setRooms(await getAllRooms());
        const brokersData = await getBrokers({ role: "broker" });
        setBrokers(brokersData.data.users || []);
        if (!found) setError("Reservation not found");
      } catch (err) {
        setError(err.message || "Failed to fetch reservation");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const handleFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCustomerSelect = (user) => {
    setSelectedCustomer(user);
    setShowCustomerSearch(false);
    setShowCreateForm(false);
  };
  const handleCustomerCreate = (name) => {
    setShowCreateForm(true);
    setCreateName(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateReservation(id, {
        ...form,
        paidAmount: Number(form.paidAmount),
        customerIds: selectedCustomer ? [selectedCustomer.id] : [],
      });
      setSuccess("Reservation updated successfully!");
      setTimeout(() => router.push(`/Reservations/${id}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!form) return null;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Reservation</h1>
      {/* Customer selection UI */}
      {selectedCustomer && !showCustomerSearch && !showCreateForm && (
        <div className="mb-4 p-2 border rounded bg-muted flex items-center gap-2">
          <span className="font-semibold">Customer:</span>
          <span>
            {selectedCustomer.username} ({selectedCustomer.phone})
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCustomerSearch(true)}
          >
            Change
          </Button>
        </div>
      )}
      {showCustomerSearch && !showCreateForm && (
        <CustomerSearch
          onSelect={handleCustomerSelect}
          onCreate={handleCustomerCreate}
        />
      )}
      {showCreateForm && (
        <div className="mb-4">
          <CreateCustomerForm
            initialName={createName}
            onCreated={handleCustomerSelect}
          />
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          name="roomId"
          value={form.roomId}
          onChange={handleFormChange}
          required
        >
          <option value="">Select Room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              Room {room.roomNumber} (Capacity: {room.capacity})
            </option>
          ))}
        </Select>
        <Select
          name="brokerId"
          value={form.brokerId}
          onChange={handleFormChange}
        >
          <option value="">No Broker</option>
          {brokers.map((broker) => (
            <option key={broker.id} value={broker.id}>
              {broker.username}
            </option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Input
            type="date"
            name="checkIn"
            value={form.checkIn}
            onChange={handleFormChange}
            required
          />
          <Input
            type="date"
            name="checkOut"
            value={form.checkOut}
            onChange={handleFormChange}
            required
          />
        </div>
        <Select
          name="reservationType"
          value={form.reservationType}
          onChange={handleFormChange}
          required
        >
          <option value="">Select Reservation Type</option>
          <option value="student_male">Student (Male)</option>
          <option value="student_female">Student (Female)</option>
          <option value="medical_male">Medical (Male)</option>
          <option value="medical_female">Medical (Female)</option>
          <option value="customer">Customer</option>
        </Select>
        <Input
          type="number"
          name="paidAmount"
          placeholder="Paid Amount"
          value={form.paidAmount}
          onChange={handleFormChange}
          required
        />
        <Select
          name="paymentStatus"
          value={form.paymentStatus}
          onChange={handleFormChange}
          required
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </Select>
        <Textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleFormChange}
        />
        {/* New check-in/check-out fields */}
        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              name="hasCheckedIn"
              checked={!!form.hasCheckedIn}
              onChange={(e) =>
                setForm((f) => ({ ...f, hasCheckedIn: e.target.checked }))
              }
            />
            <span>Checked In</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              name="hasCheckedOut"
              checked={!!form.hasCheckedOut}
              onChange={(e) =>
                setForm((f) => ({ ...f, hasCheckedOut: e.target.checked }))
              }
            />
            <span>Checked Out</span>
          </label>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
}
