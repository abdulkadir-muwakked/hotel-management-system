"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAllUsers,
  getAllRooms,
  getAllReservations,
  createRoom as apiCreateRoom,
} from "@/lib/utils";
//---------------------------------- Auth Context
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser && storedUser !== "undefined") {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }
  }, []);

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

//---------------------------------- Users Context
const UserContext = createContext();
const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Add this function to allow manual refresh after create
  const addUser = (user) => {
    setUsers((prev) => [user, ...prev]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, fetchUsers, addUser }}>
      {children}
    </UserContext.Provider>
  );
};

const useUsers = () => useContext(UserContext);

//---------------------------------- Rooms Context
const RoomContext = createContext();
const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);

  const fetchRooms = async () => {
    try {
      const data = await getAllRooms();
      setRooms(data?.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  // Add this function to allow manual refresh after create
  const addRoom = (room) => {
    setRooms((prev) => [room, ...prev]);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <RoomContext.Provider value={{ rooms, fetchRooms, addRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

const useRooms = () => useContext(RoomContext);
//-------------------- Reservations Context --------------------
const ReservationsContext = createContext();

export const ReservationsProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllReservations();
      setReservations(data.reservations || data.data || data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <ReservationsContext.Provider
      value={{ reservations, fetchReservations, loading, error }}
    >
      {children}
    </ReservationsContext.Provider>
  );
};

const useReservations = () => useContext(ReservationsContext);

//---------------------------------- App Provider
const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <RoomProvider>
          <ReservationsProvider>{children}</ReservationsProvider>
        </RoomProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export {
  AuthProvider,
  AppProvider,
  useAuth,
  useUsers,
  useRooms,
  useReservations,
};
