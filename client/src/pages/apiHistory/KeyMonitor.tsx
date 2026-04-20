import React, { useState, useEffect, useCallback, useRef } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

import KeyMonitorActive from "./KeyMonitorActive";
import KeyMonitorDeleted from "./KeyMonitorDeleted";
import { useAuth } from "../../context/AuthContext";

function KeyMonitor() {
  const { user } = useAuth();

  return (
    <>
      <KeyMonitorActive></KeyMonitorActive>
      {user?.role == "Admin" && (
        <>
          <div className="pb-5"></div>
          <KeyMonitorDeleted></KeyMonitorDeleted>
        </>
      )}
    </>
  );
}

export default KeyMonitor;
