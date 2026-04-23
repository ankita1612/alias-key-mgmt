import { useState } from "react";
import { FiLogOut, FiUser, FiSettings, FiChevronDown } from "react-icons/fi";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useRef, useEffect } from "react";
import apiClient from "../../services/apiClient";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleLogout = async () => {
    try {
      await apiClient.post(BACKEND_URL + "/api/auth/logout");

      toast.success("Logout successfully"); // ✅ toaster here
    } catch (err) {
      toast.error("Logout failed"); // optional error toast
    }

    logout();

    navigate("/login", {
      replace: true,
    });
  };
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white shadow-sm ">
      {/* Left */}
      <div />
      {/* Center Title */}
      <h1 className="absolute text-lg font-semibold text-gray-800 -translate-x-1/2 left-1/2 md:text-xl"></h1>

      {/* Right Section */}
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 transition-all duration-200 ease-out rounded-sm group "
        >
          <div className="flex items-center justify-center w-8 h-8 text-gray-700 transition-all duration-200 bg-gray-200 rounded-full group-hover:bg-gray-300 group-hover:scale-105">
            {user?.first_name?.charAt(0) || "U"}
          </div>

          <span className="hidden text-sm font-normal transition sm:block text-primary hover:text-menuActive">
            {user?.first_name}
          </span>

          <FiChevronDown
            className={`text-gray-500 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 z-20 w-48 py-2 mt-2 bg-white rounded-md shadow-lg">
            {/* Logout */}
            <Link
              to="/login"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 transition-colors duration-200 rounded-xl hover:text-red-500"
            >
              <FiLogOut />
              Logout
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
