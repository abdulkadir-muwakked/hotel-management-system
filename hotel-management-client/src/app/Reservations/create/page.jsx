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
import { RadioGroup } from "@/components/ui/radio-group";
import PaymentsSection from "@/components/PaymentsSection";

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
    reservationType: "student_male",
    checkIn: "",
    checkOut: "",
    price: "",
    priceUnit: "day",
    notes: "",
    university: "",
    hospital: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [commissionType, setCommissionType] = useState("percent");
  const [brokerCommissionPercent, setBrokerCommissionPercent] = useState(0);
  const [brokerCommissionAmount, setBrokerCommissionAmount] = useState(0);
  const [payments, setPayments] = useState([]);

  React.useEffect(() => {
    // Fetch brokers and rooms
    getBrokers({ role: "broker" }).then((data) =>
      setBrokers(data.data.users || [])
    );
    getAllRooms().then(setRooms);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // Prevent checkOut (departure) from being set before checkIn (entry)
    if (name === "checkOut" && form.checkIn && value < form.checkIn) {
      // Optionally show an error or just ignore
      setError("Departure date cannot be before entry date.");
      return;
    }
    if (name === "checkIn" && form.checkOut && value > form.checkOut) {
      setError("Entry date cannot be after departure date.");
      return;
    }
    setError("");
    setForm((f) => ({ ...f, [name]: value }));
  };

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

  const handlePaymentsChange = (newPayments) => {
    setPayments(newPayments);
  };

  // Helper to calculate number of days
  const getDays = () => {
    if (!form.checkIn || !form.checkOut) return 0;
    const start = dayjs(form.checkIn);
    const end = dayjs(form.checkOut);
    // Always use absolute difference in days, inclusive
    return end.diff(start, "day");
  };

  // Helper to build customerDetails for API
  const getCustomerDetails = () => {
    if (
      form.reservationType === "student_male" ||
      form.reservationType === "student_female"
    ) {
      return { university: form.university };
    }
    if (
      form.reservationType === "medical_male" ||
      form.reservationType === "medical_female"
    ) {
      return { hospital: form.hospital };
    }
    return {};
  };

  const getTotalPrice = () => {
    if (!form.price) return 0;
    if (form.priceUnit === "seasonal") {
      return Number(form.price);
    }
    if (!getDays) return 0;

    const total = getDays() * form.price;
    console.log(total);
    return total;
  };

  // Broker commission calculation
  const getBrokerCommission = () => {
    const total = getTotalPrice();
    if (!form.brokerId) return 0;
    if (commissionType === "percent") {
      return ((brokerCommissionPercent || 0) / 100) * total;
    } else {
      return brokerCommissionAmount || 0;
    }
  };
  const getRemainingAmount = () => {
    return getTotalPrice() - getBrokerCommission();
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
      // Map priceUnit to backend values
      const priceUnitMap = {
        day: "daily",
        month: "monthly",
        seasonal: "seasonal",
      };
      const payload = {
        ...form,
        priceUnit: priceUnitMap[form.priceUnit] || form.priceUnit,
        customerIds: [selectedCustomer.id],
        customerDetails: getCustomerDetails(),
        brokerCommissionPercent:
          form.brokerId && commissionType === "percent"
            ? brokerCommissionPercent
            : null,
        brokerCommissionAmount:
          form.brokerId && commissionType === "amount"
            ? brokerCommissionAmount
            : null,
        payments,
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
    <div className="flex gap-4">
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
          {/* Broker commission logic */}
          {form.brokerId && (
            <div className="border rounded p-3 bg-muted mb-2">
              <div className="font-semibold mb-2">Broker Commission</div>
              <RadioGroup
                value={commissionType}
                onValueChange={setCommissionType}
                className="flex gap-4 mb-2"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="percent"
                    checked={commissionType === "percent"}
                    onChange={() => setCommissionType("percent")}
                  />
                  Commission Percent
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="amount"
                    checked={commissionType === "amount"}
                    onChange={() => setCommissionType("amount")}
                  />
                  Commission Amount
                </label>
              </RadioGroup>
              {commissionType === "percent" ? (
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={brokerCommissionPercent}
                  onChange={(e) =>
                    setBrokerCommissionPercent(Number(e.target.value))
                  }
                  placeholder="Commission Percent (%)"
                  className="mb-2"
                />
              ) : (
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={brokerCommissionAmount}
                  onChange={(e) =>
                    setBrokerCommissionAmount(Number(e.target.value))
                  }
                  placeholder="Commission Amount"
                  className="mb-2"
                />
              )}
              <div className="text-sm text-muted-foreground mb-1">
                Broker Receives:{" "}
                <span className="font-semibold">
                  {getBrokerCommission().toFixed(2)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Remaining Amount:{" "}
                <span className="font-semibold">
                  {getRemainingAmount().toFixed(2)}
                </span>
              </div>
            </div>
          )}
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
          {/* Show number of days dynamically */}
          {form.checkIn && form.checkOut && (
            <div className="text-sm text-muted-foreground mb-2">
              Number of days: {getDays()}
            </div>
          )}
          <Select
            name="reservationType"
            value={form.reservationType}
            onChange={handleFormChange}
            required
          >
            <option value="student_male">Student (Male)</option>
            <option value="student_female">Student (Female)</option>
            <option value="medical_male">Medical (Male)</option>
            <option value="medical_female">Medical (Female)</option>
            <option value="customer">Customer</option>
          </Select>
          {/* Show university field for student types */}
          {(form.reservationType === "student_male" ||
            form.reservationType === "student_female") && (
            <Input
              name="university"
              placeholder="University"
              value={form.university}
              onChange={handleFormChange}
              required
            />
          )}
          {/* Show hospital field for medical types */}
          {(form.reservationType === "medical_male" ||
            form.reservationType === "medical_female") && (
            <Input
              name="hospital"
              placeholder="Hospital"
              value={form.hospital}
              onChange={handleFormChange}
              required
            />
          )}
          <Input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleFormChange}
            required
          />
          {form.price && getTotalPrice && (
            <div className="text-sm text-muted-foreground mb-2">
              Total Price: {getTotalPrice()}
            </div>
          )}
          <Select
            name="priceUnit"
            value={form.priceUnit}
            onChange={handleFormChange}
            required
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="seasonal">Seasonal</option>
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
      <div>
        {/* Only show PaymentsSection if reservationId is available (i.e., in edit mode) */}
        <PaymentsSection
          payments={payments}
          onPaymentsChange={handlePaymentsChange}
          totalPrice={getTotalPrice()}
          // reservationId and receivedBy are not passed in create mode
        />
      </div>
    </div>
  );
}
