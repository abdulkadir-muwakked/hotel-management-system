// Reservation creation page with customer search/create flow
"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import CreateUserPage from "@/app/users/create/page";
import { Label } from "@/components/ui/label";

// Dummy API functions (replace with real ones)
import {
  getAllUsers,
  createUser,
  getAllRooms,
  getAllUsers as getBrokers,
  createReservation,
} from "@/lib/utils";

export function CustomerSearch({ onSelect, onCreate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers({ search: query });
      setResults(data.data.users || []);
      setShowCreate((data.data.users || []).length === 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 items-end">
        <Input
          placeholder="Search customer by name, phone, or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading || !query}>
          Search
        </Button>
        <Button
          size="icon"
          variant="secondary"
          title="Add new user"
          onClick={() => onCreate(query)}
        >
          <span className="text-xl font-bold">+</span>
        </Button>
      </div>
      {results.length > 0 && (
        <div className="mt-2 border rounded p-2 bg-muted">
          <div className="font-semibold mb-1">Select Customer:</div>
          {results.map((user) => (
            <div key={user.id} className="flex items-center gap-2 mb-1">
              <span>
                {user.username} ({user.phone})
              </span>
              <Button size="sm" onClick={() => onSelect(user)}>
                Select
              </Button>
            </div>
          ))}
        </div>
      )}
      {showCreate && (
        <div className="mt-2">
          <div className="font-semibold mb-1">No customer found.</div>
          <Button variant="secondary" onClick={() => onCreate(query)}>
            Create New Account
          </Button>
        </div>
      )}
    </div>
  );
}

function CreateCustomerForm({ initialName, onCreated }) {
  const [form, setForm] = useState({
    username: initialName || "",
    phone: "",
    email: "",
    password: "", // Add password field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [documentsPreview, setDocumentsPreview] = useState([]);
  const [documents, setDocuments] = useState([]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentsPreview(files);
    setDocuments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!form.email) throw new Error("Email is required");
      if (!form.password) throw new Error("Password is required");
      // Create user
      const user = await createUser(form);
      // Upload documents if any
      if (documents.length && user.data?.user?.id) {
        await uploadUserDocuments(user.data.user.id, documents);
      }
      // Instead of redirect, just call onCreated
      onCreated(user.data?.user || user.user || user);
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
      <Input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
      />
      <div>
        <Label htmlFor="documents">Documents</Label>
        <input
          id="documents"
          name="documents"
          type="file"
          multiple
          className="w-full border rounded px-2 py-2 mb-2"
          onChange={handleDocumentsChange}
        />
        {/* Preview selected images before submit */}
        <div className="flex flex-wrap gap-2 mt-2">
          {documentsPreview.map((file, idx) => {
            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(
              file.name
            );
            if (isImage) {
              const url = URL.createObjectURL(file);
              return (
                <img
                  key={idx}
                  src={url}
                  alt={file.name}
                  className="max-h-24 rounded border shadow"
                  style={{ maxWidth: "100px", objectFit: "contain" }}
                  onLoad={() => URL.revokeObjectURL(url)}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create & Select"}
      </Button>
    </form>
  );
}

export default function CreateReservationPage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState("");
  const [brokers, setBrokers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [documentsPreview, setDocumentsPreview] = useState([]);
  const [form, setForm] = useState({
    roomId: "",
    brokerId: "",
    reservationType: "daily",
    checkIn: "",
    checkOut: "",
    paidAmount: "",
    paymentStatus: "pending",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  React.useEffect(() => {
    // Fetch brokers and rooms
    getBrokers({ role: "broker" }).then((data) =>
      setBrokers(data.data.users || [])
    );
    getAllRooms().then(setRooms);
  }, []);

  const handleFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCustomerSelect = (user) => {
    setSelectedCustomer(user);
    setShowCreateForm(false);
  };
  const handleCustomerCreate = (name) => {
    setShowCreateForm(true);
    setCreateName(name);
  };
  const handleCustomerCreated = (user) => {
    setSelectedCustomer(user);
    setShowCreateForm(false);
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentsPreview(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      if (!selectedCustomer)
        throw new Error("Please select or create a customer.");
      if (!form.roomId) throw new Error("Please select a room.");
      if (!form.checkIn || !form.checkOut)
        throw new Error("Please select check-in and check-out dates.");
      const payload = {
        ...form,
        paidAmount: Number(form.paidAmount),
        customerIds: [selectedCustomer.id],
      };
      await createReservation(payload);
      setSuccess("Reservation created successfully!");
      setTimeout(() => router.push("/Reservations"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Reservation</h1>
      {!selectedCustomer && !showCreateForm && (
        <CustomerSearch
          onSelect={handleCustomerSelect}
          onCreate={handleCustomerCreate}
        />
      )}
      {showCreateForm && (
        <div className="mb-4">
          <CreateUserPage
            onCreated={handleCustomerCreated}
            initialName={createName}
          />
        </div>
      )}
      {selectedCustomer && !showCreateForm && (
        <div className="mb-4 p-2 border rounded bg-muted flex items-center gap-2">
          <span className="font-semibold">Customer:</span>
          <span>
            {selectedCustomer.username} ({selectedCustomer.phone})
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedCustomer(null)}
          >
            Change
          </Button>
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

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Creating..." : "Create Reservation"}
        </Button>
      </form>
    </div>
  );
}
