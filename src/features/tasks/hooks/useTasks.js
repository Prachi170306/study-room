import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";

import { auth } from "../../../firebase";

import {
  subscribeToTasks,
  addTaskToFirestore,
  updateTaskInFirestore,
  deleteTaskFromFirestore,
} from "../services/taskService";

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Sign in anonymously if no user is logged in
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Firebase authentication successful!");
        console.log("User UID:", user.uid);
        console.log("Anonymous user:", user.isAnonymous);

        setUserId(user.uid);
        return;
      }

      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Firebase authentication error:", err);
        setError(err.message);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore changes
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setError("");

    const unsubscribeTasks = subscribeToTasks(
      userId,
      (data) => {
        setTasks(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribeTasks();
  }, [userId]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    }),
    [tasks],
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (task.title || "").toLowerCase().includes(searchText) ||
        (task.subject || "").toLowerCase().includes(searchText) ||
        (task.description || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  async function addTask(taskData) {
    if (!userId) throw new Error("User authentication is not ready");

    return addTaskToFirestore(userId, taskData);
  }

  async function updateTask(id, updatedData) {
    if (!userId) throw new Error("User authentication is not ready");

    return updateTaskInFirestore(userId, id, updatedData);
  }

  async function deleteTask(id) {
    if (!userId) throw new Error("User authentication is not ready");

    return deleteTaskFromFirestore(userId, id);
  }

  async function updateTaskStatus(id, status) {
    return updateTask(id, { status });
  }

  return {
    tasks,
    filteredTasks,
    stats,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    loading,
    error,
  };
}
