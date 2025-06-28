import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export async function login({ email, password }) {
  const res = await fetch("http://localhost:3000/api/auth/login", {
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
  const res = await fetch("http://localhost:3000/api/users/all", {
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
