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
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
import { CustomerSearch } from "../../create/page";
import { RadioGroup } from "@/components/ui/radio-group";
import PaymentsSection from "@/components/PaymentsSection";

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

  // Commission logic
  const [commissionType, setCommissionType] = useState("percent");
  const [brokerCommissionPercent, setBrokerCommissionPercent] = useState(0);
  const [brokerCommissionAmount, setBrokerCommissionAmount] = useState(0);
  const [payments, setPayments] = useState([]);
  // Get current user ID from localStorage
  const currentUserId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))?.id
      : null;

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
                brokerId: found.broker?.id || "",
                reservationType: found.reservationType || "student_male",
                checkIn: found.checkIn
                  ? dayjs(found.checkIn).format("YYYY-MM-DD")
                  : "",
                checkOut: found.checkOut
                  ? dayjs(found.checkOut).format("YYYY-MM-DD")
                  : "",
                price: found.price || "",
                priceUnit:
                  found.priceUnit === "daily"
                    ? "day"
                    : found.priceUnit === "monthly"
                    ? "month"
                    : found.priceUnit || "day",
                university:
                  found.customerDetails?.university || found.university || "",
                hospital:
                  found.customerDetails?.hospital || found.hospital || "",
                notes: found.notes || "",
                hasCheckedIn: found.hasCheckedIn || false,
                hasCheckedOut: found.hasCheckedOut || false,
              }
            : null
        );
        setSelectedCustomer(found?.customers?.[0] || null);
        setRooms(await getAllRooms());
        const brokersData = await getBrokers({ role: "broker" });
        setBrokers(brokersData.data.users || []);
        // Set commission state
        if (found?.brokerCommissionPercent) {
          setCommissionType("percent");
          setBrokerCommissionPercent(Number(found.brokerCommissionPercent));
          setBrokerCommissionAmount(0);
        } else if (found?.brokerCommissionAmount) {
          setCommissionType("amount");
          setBrokerCommissionAmount(Number(found.brokerCommissionAmount));
          setBrokerCommissionPercent(0);
        } else {
          setCommissionType("percent");
          setBrokerCommissionPercent(0);
          setBrokerCommissionAmount(0);
        }
        if (!found) setError("Reservation not found");
      } catch (err) {
        setError(err.message || "Failed to fetch reservation");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  // Helper to calculate number of days
  const getDays = () => {
    if (!form?.checkIn || !form?.checkOut) return 0;
    const start = dayjs(form.checkIn);
    const end = dayjs(form.checkOut);
    return end.diff(start, "day");
  };
  const getTotalPrice = () => {
    if (!form?.price) return 0;
    if (form.priceUnit === "seasonal") return Number(form.price);
    return getDays() * Number(form.price);
  };
  const getBrokerCommission = () => {
    const total = getTotalPrice();
    if (!form?.brokerId) return 0;
    if (commissionType === "percent") {
      return ((brokerCommissionPercent || 0) / 100) * total;
    } else {
      return brokerCommissionAmount || 0;
    }
  };
  const getRemainingAmount = () => {
    return getTotalPrice() - getBrokerCommission();
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

  // Date validation
  const isDateValid = () => {
    if (!form?.checkIn || !form?.checkOut) return true;
    return dayjs(form.checkOut).isSameOrAfter(dayjs(form.checkIn));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Patch form with customer details when user changes
  const handleCustomerSelect = (user) => {
    setSelectedCustomer(user);
    setShowCustomerSearch(false);
    setShowCreateForm(false);
    // Optionally patch form with user info if needed
    // Force re-render by updating form (if you want to patch customer details)
    setForm((f) => ({ ...f }));
  };
  const handleCustomerCreate = (name) => {
    setShowCreateForm(true);
    setCreateName(name);
  };
  const handlePaymentsChange = (newPayments) => {
    setPayments(newPayments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    if (!isDateValid()) {
      setError("Check-out date cannot be before check-in date.");
      setSaving(false);
      return;
    }
    try {
      // Map priceUnit to backend values
      const priceUnitMap = {
        day: "daily",
        month: "monthly",
        seasonal: "seasonal",
      };
      await updateReservation(id, {
        ...form,
        brokerId: form.brokerId ? form.brokerId : null,
        priceUnit: priceUnitMap[form.priceUnit] || form.priceUnit,
        customerIds: selectedCustomer ? [selectedCustomer.id] : [],
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
    <div className="flex gap-4">
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
              onClick={() => {
                setShowCustomerSearch(true);
                setSelectedCustomer(null);
              }}
            >
              Change
            </Button>
          </div>
        )}
        {/* Show broker info if present */}
        {/* {form.brokerId && (
          <div className="mb-2 p-2 border rounded bg-muted flex items-center gap-2">
            <span className="font-semibold">Broker:</span>
            <span>
              {brokers.find((b) => String(b.id) === String(form.brokerId))
                ?.username || form.brokerId}
            </span>
          </div>
        )} */}
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
            value={String(form.brokerId)}
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
          {form.price && (
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
          {/* Add checkboxes for hasCheckedIn and hasCheckedOut */}
          <div className="flex gap-4 items-center mb-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                name="hasCheckedIn"
                checked={!!form.hasCheckedIn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hasCheckedIn: e.target.checked }))
                }
              />
              Checked In
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
              Checked Out
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
      <div>
        <PaymentsSection
          payments={payments}
          onPaymentsChange={handlePaymentsChange}
          reservationId={id}
          receivedBy={currentUserId}
          totalPrice={getTotalPrice()} // <-- Pass total price to PaymentsSection
        />
      </div>
    </div>
  );
}
