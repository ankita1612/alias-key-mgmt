import apiClient from "../services/apiClient";
import React, { useState, useEffect, useCallback, useRef } from "react";

function Dashboard() {
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/api/dashboard");
    } catch (error: any) {
      if (error.name !== "CanceledError") {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load data",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <div>Dashboard</div>;
}

export default Dashboard;
