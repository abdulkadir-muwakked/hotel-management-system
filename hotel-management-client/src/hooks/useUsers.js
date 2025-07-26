// src/hooks/useUsers.js
import { useState, useEffect, useContext, createContext } from "react";
import {
  getAllUsers,
  getUserById,
  createUser as createUserApi,
  updateUser,
  deleteUser,
} from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const UsersContext = createContext();

export function useUsers() {
  return useContext(UsersContext);
}

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data.data?.users || data.users || []);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const addUser = (user) => setUsers((prev) => [...prev, user]);

  const updateUserInContext = (updated) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updated.id || u._id === updated._id ? updated : u
      )
    );
  };

  const deleteUserFromContext = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
  };

  // Unified createUser for both customer and admin
  const createUser = async (userData, { isCustomer = false } = {}) => {
    const payload = { ...userData };
    if (isCustomer) {
      if (!payload.email) delete payload.email;
      delete payload.password;
    }
    const res = await createUserApi(payload);
    addUser(res.user || res.data?.user || res);
    return res;
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        addUser,
        updateUserInContext,
        deleteUserFromContext,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        currentUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
