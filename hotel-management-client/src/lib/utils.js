import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
  console.log(data);

  if (data.user && data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    console.log("user", JSON.stringify(data.user));
    console.log("from localStorage ", localStorage.getItem("user"));
    return data.user;
  } else {
    console.warn("Login response missing user or token", data);
    return null;
  }
}
export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/api/users/all`, {
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
  console.log(data);
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
  console.log("user", JSON.stringify(user));

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
  console.log("Avatar uploaded successfully:", data);
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

//≈ -------------------users---------------------------

//≈ -------------------rooms---------------------------
export async function getAllRooms() {
  const res = await fetch(`${BASE_URL}/api/rooms/`, {
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
  return data.rooms || data.data || Array.isArray(data) ? data : [];
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
