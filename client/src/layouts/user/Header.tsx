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
    <header className=" flex items-center justify-between bg-white  px-6 py-4 shadow-sm sticky top-0 z-10">
      {/* Left */}
      <div />
      {/* Center Title */}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-semibold text-gray-800"></h1>

      {/* Right Section */}
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="group flex items-center gap-2 px-3 py-2 rounded-xl
             transition-all duration-200 ease-out
             hover:bg-gray-100 hover:shadow-md
             hover:-translate-y-[1px]
             active:scale-[0.97]
             focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full
               bg-gray-200 text-gray-700 
               transition-all duration-200
               group-hover:bg-gray-300 group-hover:scale-105"
          >
            {user?.first_name?.charAt(0) || "U"}
          </div>

          <span className="hidden sm:block text-sm font-normal text-primary hover:text-menuActive transition">
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
          <div className="absolute right-0 mt-2 w-48 bg-white  rounded-xl shadow-lg py-2 z-20">
            {/* Logout */}
            <Link
              to="/login" // or wherever you want to redirect after logout
              onClick={handleLogout}
              className="text-sm flex items-center gap-2 px-3 py-2 rounded-xl 
  transition-all duration-200 
  hover:bg-gray-100 hover:shadow-sm hover:scale-[1.02] 
  active:scale-[0.98]
"
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
