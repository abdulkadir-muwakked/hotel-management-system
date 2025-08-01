import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

//≈ -------------------users---------------------------
export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();

  if (data.user && data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  } else {
    console.warn("Login response missing user or token", data);
    return null;
  }
}
export async function getAllUsers(filters = {}) {
  // Build query string from filters
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.append(key, value);
  });
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE_URL}/api/users/all${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data;
}
export async function getUserById(id) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return data.user || data.data || data;
}

export async function updateUser(id, user) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update user");
  return data;
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete user");
  }
  return true;
}

export async function uploadUserAvatar(id, file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetch(`${BASE_URL}/api/users/${id}/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to upload avatar");
  return data;
}

export async function createUser(userData) {
  const res = await fetch(`${BASE_URL}/api/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create user");
  return data;
}

export async function uploadUserDocuments(userId, documents) {
  if (!documents.length) return;
  const formData = new FormData();
  documents.forEach((file) => formData.append("documents", file));
  const res = await fetch(`${BASE_URL}/api/users/${userId}/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload documents");
  return await res.json();
}
//≈ -------------------users---------------------------

//≈ -------------------rooms---------------------------
export async function getAllRooms(filters = {}) {
  // Map frontend filter values to backend
  const mappedFilters = { ...filters };
  if (mappedFilters.available === "available") {
    mappedFilters.available = "empty";
  }
  // "clean" and "dirty" are sent as-is
  const params = new URLSearchParams();
  Object.entries(mappedFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.append(key, value);
  });
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE_URL}/api/rooms/${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch rooms");
  }

  const data = await res.json();
  // Always return an array, even if undefined/null
  return data.rooms || data.data || (Array.isArray(data.data) ? data.data : []);
}
export async function createRoom(room) {
  const res = await fetch(`${BASE_URL}/api/rooms/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(room),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create room");
  return data;
}
export async function updateRoom(id, room) {
  const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(room),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update room");
  return data;
}
export async function deleteRoom(id) {
  const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete room");
  }
  return true;
}
export async function getRoomById(id) {
  const res = await fetch(`${BASE_URL}/api/rooms/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch room");
  }
  const data = await res.json();
  // Support both {room: {...}} and {data: {...}} and fallback
  return data.room || data.data || data;
}
//≈ -------------------rooms---------------------------
//≈ -------------------Reservations---------------------------
export async function getAllReservations() {
  const res = await fetch(`${BASE_URL}/api/reservations/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reservations");
  }

  const data = await res.json();

  return data.reservations || data.data || [];
}

export async function updateReservation(id, updates) {
  // تنظيف البيانات: حذف أي قيم undefined أو null
  const cleanUpdates = {};
  for (const key in updates) {
    if (updates[key] !== undefined && updates[key] !== null) {
      cleanUpdates[key] = updates[key];
    }
  }

  const res = await fetch(`${BASE_URL}/api/reservations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(cleanUpdates),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Failed to update:", data);
    throw new Error(data.message || "Failed to update reservation");
  }

  return data;
}

export async function deleteReservation(id) {
  const res = await fetch(`${BASE_URL}/api/reservations/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete reservation");
  }
  return true;
}
export async function createReservation(reservation) {
  const res = await fetch(`${BASE_URL}/api/reservations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(reservation),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create reservation");
  return data;
}
//≈ -------------------Reservations---------------------------
//≈ -------------------Payments---------------------------
export async function getAllPayments() {
  const res = await fetch(`${BASE_URL}/api/payments/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch payments");
  const data = await res.json();
  return data.payments || data.data || [];
}

export async function getPaymentById(id) {
  const res = await fetch(`${BASE_URL}/api/payments/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch payment");
  const data = await res.json();
  return data.payment || data.data || data;
}

export async function getPaymentsByReservation(reservationId) {
  const res = await fetch(
    `${BASE_URL}/api/payments/reservations/${reservationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch payments for reservation");
  const data = await res.json();
  return data.payments || data.data || [];
}

export async function createPayment(payment) {
  const res = await fetch(`${BASE_URL}/api/payments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payment),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create payment");
  return data;
}

export async function updatePayment(id, payment) {
  const res = await fetch(`${BASE_URL}/api/payments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payment),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update payment");
  return data;
}

export async function deletePayment(id) {
  const res = await fetch(`${BASE_URL}/api/payments/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete payment");
  }
  return true;
}
//≈ -------------------Payments---------------------------
export function sortRooms(rooms) {
  return [...rooms].sort((a, b) => {
    const aNum = Number(a.roomNumber);
    const bNum = Number(b.roomNumber);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return String(a.roomNumber).localeCompare(String(b.roomNumber));
  });
}

export function useFilteredRooms({ type }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      setError("");
      try {
        const data = await getAllRooms(type ? { type } : {});
        setRooms(sortRooms(data));
      } catch (err) {
        setError(err.message || "Failed to fetch rooms");
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [type]);

  return { rooms, loading, error };
}
