"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAllUsers,
  getAllRooms,
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, fetchUsers }}>
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

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <RoomContext.Provider value={{ rooms, fetchRooms }}>
      {children}
    </RoomContext.Provider>
  );
};

const useRooms = () => useContext(RoomContext);

//---------------------------------- App Provider
const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <RoomProvider>{children}</RoomProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export { AuthProvider, AppProvider, useAuth, useUsers, useRooms };
