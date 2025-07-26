import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import {
  createPayment,
  deletePayment,
  updatePayment,
  getPaymentsByReservation,
} from "@/lib/utils";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank Transfer" },
  { value: "other", label: "Other" },
];

export default function PaymentsSection({
  payments,
  onPaymentsChange,
  reservationId,
  receivedBy,
  totalPrice = 0,
}) {
  const [form, setForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    amount: "",
    method: PAYMENT_METHODS[0].value,
    notes: "",
  });
  const [localPayments, setLocalPayments] = useState(payments || []);
  const [apiError, setApiError] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editForm, setEditForm] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    amount: "",
    method: PAYMENT_METHODS[0].value,
    notes: "",
  });
  console.log("Payments:", localPayments);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Add payment to backend and local state
  const handleAdd = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setApiError("Amount is required and must be positive.");
      return;
    }
    if (!reservationId || isNaN(Number(reservationId))) {
      setApiError("Reservation ID is required.");
      return;
    }
    if (!receivedBy || isNaN(Number(receivedBy))) {
      setApiError("ReceivedBy (user ID) is required.");
      return;
    }
    try {
      // Clean payload: only send required fields and valid values
      const paymentPayload = {
        reservationId: Number(reservationId),
        amount: Number(form.amount),
        paymentDate: form.date,
        paymentMethod: form.method,
        notes: form.notes,
        receivedBy: Number(receivedBy),
      };
      const result = await createPayment(paymentPayload);
      const newPayment = result.payment || result.data || paymentPayload;
      const newPayments = [...localPayments, newPayment];
      setLocalPayments(newPayments);
      setForm({
        date: dayjs().format("YYYY-MM-DD"),
        amount: "",
        method: PAYMENT_METHODS[0].value,
        notes: "",
      });
      if (onPaymentsChange) onPaymentsChange(newPayments);
    } catch (err) {
      setApiError(err.message || "Failed to add payment");
    }
  };

  // Remove payment from backend and local state
  const handleRemove = async (idx) => {
    setApiError("");
    const payment = localPayments[idx];
    try {
      if (payment.id) {
        await deletePayment(payment.id);
      }
      const newPayments = localPayments.filter((_, i) => i !== idx);
      setLocalPayments(newPayments);
      if (onPaymentsChange) onPaymentsChange(newPayments);
    } catch (err) {
      setApiError(err.message || "Failed to remove payment");
    }
  };

  // Edit payment logic
  const handleEdit = (idx) => {
    setEditIdx(idx);
    const p = localPayments[idx];
    setEditForm({
      date: p.date || dayjs().format("YYYY-MM-DD"),
      amount: p.amount,
      method: p.method,
      notes: p.notes || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setApiError("");
    if (
      !editForm.amount ||
      isNaN(editForm.amount) ||
      Number(editForm.amount) <= 0
    ) {
      setApiError("Amount is required and must be positive.");
      return;
    }
    try {
      const payment = localPayments[editIdx];
      const updatedPayment = {
        ...payment,
        amount: Number(editForm.amount),
        date: editForm.date,
        method: editForm.method,
        notes: editForm.notes,
      };
      if (payment.id) {
        await updatePayment(payment.id, {
          amount: updatedPayment.amount,
          paymentDate: updatedPayment.date,
          paymentMethod: updatedPayment.method,
          notes: updatedPayment.notes,
        });
      }
      const newPayments = localPayments.map((p, i) =>
        i === editIdx ? updatedPayment : p
      );
      setLocalPayments(newPayments);
      setEditIdx(null);
      if (onPaymentsChange) onPaymentsChange(newPayments);
    } catch (err) {
      setApiError(err.message || "Failed to update payment");
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
  };

  // Fetch all payments for this reservation on mount or when reservationId changes
  useEffect(() => {
    async function fetchPayments() {
      if (reservationId) {
        try {
          const allPayments = await getPaymentsByReservation(reservationId);
          setLocalPayments(allPayments);
          if (onPaymentsChange) onPaymentsChange(allPayments);
        } catch (err) {
          setApiError(err.message || "Failed to fetch payments");
        }
      }
    }
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationId]);

  // Calculate total paid and left
  const totalPaid = localPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const leftToPay = Math.max(Number(totalPrice) - totalPaid, 0);
  const overPaid = totalPaid > Number(totalPrice);

  return (
    <div className="border rounded p-4 mb-4 bg-muted">
      <div className="font-semibold mb-2">Payments</div>
      <form className="flex flex-col gap-2 mb-2" onSubmit={handleAdd}>
        <Input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <Input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          min={0.01}
          step={0.01}
          required
        />
        <Select
          name="method"
          value={form.method}
          onChange={handleChange}
          required
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
        <Textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notes (optional)"
        />
        <Button type="submit" className="w-full">
          Add Payment
        </Button>
      </form>
      {apiError && <div className="text-red-500 text-sm mb-2">{apiError}</div>}
      <div className="flex gap-4 mb-2">
        <div className="text-sm font-semibold">
          Total Paid:{" "}
          <span
            className={overPaid ? "text-red-700 font-bold" : "text-green-700"}
          >
            {totalPaid.toFixed(2)}
          </span>
        </div>
        <div className="text-sm font-semibold">
          Left to Pay:{" "}
          <span className="text-red-700">{leftToPay.toFixed(2)}</span>
        </div>
      </div>
      {overPaid && (
        <div className="text-red-700 font-semibold mb-2">
          Warning: Total Paid exceeds Total Price! (Overpaid by{" "}
          {(totalPaid - Number(totalPrice)).toFixed(2)} )
        </div>
      )}
      {localPayments.length > 0 && (
        <div className="mt-2">
          <div className="font-semibold mb-1">Added Payments</div>
          <ul className="space-y-2">
            {localPayments.map((p, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-white rounded p-2 shadow"
              >
                <div>
                  <div className="text-sm font-medium">
                    {dayjs(p.date || p.paymentDate).format("YYYY-MM-DD")}
                  </div>
                  <div className="text-sm">
                    Amount: <span className="font-semibold">{p.amount}</span>
                  </div>
                  <div className="text-sm">
                    Method:{" "}
                    {PAYMENT_METHODS.find(
                      (m) => m.value === (p.method || p.paymentMethod)
                    )?.label ||
                      p.method ||
                      p.paymentMethod}
                  </div>
                  {p.receivedByUser && p.receivedByUser.username && (
                    <div className="text-sm">
                      Received By:{" "}
                      <span className="font-semibold">
                        {p.receivedByUser.username}
                      </span>
                    </div>
                  )}
                  {p.notes && (
                    <div className="text-xs text-muted-foreground">
                      Notes: {p.notes}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(idx)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(idx)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {editIdx !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white rounded shadow-lg p-6 w-full max-w-sm"
            onSubmit={handleEditSave}
          >
            <div className="font-semibold mb-2">Edit Payment</div>
            <Input
              type="date"
              name="date"
              value={editForm.date}
              onChange={handleEditChange}
              required
            />
            <Input
              type="number"
              name="amount"
              value={editForm.amount}
              onChange={handleEditChange}
              placeholder="Amount"
              min={0.01}
              step={0.01}
              required
            />
            <Select
              name="method"
              value={editForm.method}
              onChange={handleEditChange}
              required
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
            <Textarea
              name="notes"
              value={editForm.notes}
              onChange={handleEditChange}
              placeholder="Notes (optional)"
            />
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="w-full">
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleEditCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
/// Added Payments
