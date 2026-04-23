import React, { useState, useEffect } from "react";

import { NavLink, Outlet, Link } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiKey,
  FiMenu,
  FiMaximize2, // Add this for expand icon
} from "react-icons/fi";
import { FaExchangeAlt, FaHome } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdClose } from "react-icons/md";

import logo from "../../assets/actowizLogo.svg";
import Header from "../../layouts/user/Header";
import Footer from "../../layouts/user/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import { useAuth } from "../../context/AuthContext";
import { HiHome } from "react-icons/hi";
const AdminLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false); // Add hover state

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle mouse enter/leave for hover expansion
  const handleMouseEnter = () => {
    if (!sidebarOpen && !isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!sidebarOpen && !isMobile) {
      setIsHovering(false);
    }
  };

  // Toggle sidebar pinned state
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setIsHovering(false); // Reset hover state when toggling
  };

  // Determine if sidebar should show expanded content
  const showExpanded = sidebarOpen || isHovering || isMobile;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
  fixed top-0 left-0 h-screen
  bg-primary text-gray-200 flex flex-col shadow-2xl
  transition-all duration-300 ease-in-out
  z-50
  ${
    isMobile
      ? `w-64 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
      : sidebarOpen
        ? "w-72 md:w-80 lg:w-[260px]"
        : isHovering
          ? "w-72 md:w-80 lg:w-[260px]"
          : "w-16"
  }
`}
      >
        {/* Logo */}
        <div className="flex items-center px-4 py-4 h-[72px]">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 min-w-0 flex-1"
          >
            {/* <div className="flex items-center w-full gap-3"> */}
            {/* Logo Icon */}
            <div
              className={`
  flex items-center justify-center flex-shrink-0 
  overflow-hidden bg-white rounded-full
  transition-all duration-300 ease-in-out
  ${showExpanded ? "w-13 h-13" : "w-9 h-9"}
`}
            >
              <img
                src={logo}
                alt="App logo"
                className={`
            shrink-0 scale-110
            transition-all duration-300 ease-in-out
            ${
              showExpanded
                ? "h-13 w-13" // 14px height when showExpanded is true
                : "h-9 w-9" // 9px height when collapsed
            }
          `}
              />
            </div>

            {/* Text and Icons Container */}
            <div
              className={`
          flex items-center justify-between flex-1
          overflow-hidden transition-all duration-300
          ${
            showExpanded
              ? "max-w-full opacity-100 translate-x-0 visible"
              : "max-w-0 opacity-0 -translate-x-2 invisible"
          }
        `}
            >
              <div className="flex flex-col w-full">
                <span className="text-[25px] font-bold text-white tracking-widest uppercase">
                  Actowiz
                </span>
                <span className="text-base font-medium text-left text-white">
                  Key Management
                </span>
              </div>

              {/* Icons Section - Always show expand/collapse buttons */}
              <div className="flex items-center gap-2">
                {/* Show Close icon when sidebar is pinned open */}
                {sidebarOpen && !isMobile && (
                  <IoClose
                    size={24}
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ IMPORTANT
                      e.preventDefault(); // ✅ prevent link navigation
                      toggleSidebar();
                    }}
                    className="text-gray-300 cursor-pointer"
                  />
                )}

                {/* Show Expand icon when sidebar is collapsed - ALWAYS VISIBLE */}
                {!sidebarOpen && !isMobile && (
                  <FiMenu
                    size={16}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleSidebar();
                    }}
                  />
                )}

                {/* Show Close icon on mobile when sidebar is open */}
                {isMobile && sidebarOpen && (
                  <MdClose
                    size={22}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setSidebarOpen(false);
                    }}
                  />
                )}
              </div>
            </div>
            {/* </div> */}
          </Link>
        </div>
        {/* Navigation */}
        <nav
          className={`
            flex-1 py-6 space-y-1
            transition-all duration-300
            ${showExpanded ? "overflow-y-auto" : "overflow-visible"}
          `}
        >
          {/* <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Main
          </p> */}
          {/* Dashboard Link */}
          {showExpanded && (
            <>
              <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                Main
              </p>
            </>
          )}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center w-full ${
                showExpanded ? "justify-start px-4" : "justify-center px-2"
              } gap-3 py-2.5 rounded-md transition-all duration-200 relative
              ${isActive ? "text-menuActive" : "text-gray-300 hover:text-menuActive"}`
            }
          >
            <FaHome size={16} className="flex-shrink-0" />
            {/* Only show text when expanded */}
            <span
              className={`
                text-[15px] font-normal whitespace-nowrap
                transition-all duration-200
                ${showExpanded ? "inline-block opacity-100" : "hidden"}
              `}
            >
              Dashboard
            </span>
          </NavLink>
          {showExpanded && (
            <>
              <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                ACT-Key Management
              </p>
            </>
          )}
          {/* Upload File Link */}
          {user?.role == "Admin" && (
            <NavLink
              to="/proxy"
              className={({ isActive }) =>
                `flex items-center w-full ${
                  showExpanded ? "justify-start px-4" : "justify-center px-2"
                } gap-3 py-2.5 rounded-md transition-all duration-200 relative
              ${isActive ? "text-menuActive" : "text-gray-300 hover:text-menuActive"}`
              }
            >
              <FaExchangeAlt size={16} className="flex-shrink-0" />
              {/* Only show text when expanded */}
              <span
                className={`
                text-[15px] font-normal whitespace-nowrap
                transition-all duration-200
                ${showExpanded ? "inline-block opacity-100" : "hidden"}
              `}
              >
                Proxy
              </span>
            </NavLink>
          )}
          <NavLink
            to="/alias-key"
            className={({ isActive }) =>
              `flex items-center w-full ${
                showExpanded ? "justify-start px-4" : "justify-center px-2"
              } gap-3 py-2.5 rounded-md transition-all duration-200 relative
              ${isActive ? "text-menuActive" : "text-gray-300 hover:text-menuActive"}`
            }
          >
            <FiKey size={16} className="flex-shrink-0" />
            {/* Only show text when expanded */}
            <span
              className={`
                text-[15px] font-normal whitespace-nowrap
                transition-all duration-200
                ${showExpanded ? "inline-block opacity-100" : "hidden"}
              `}
            >
              Key Management
            </span>
          </NavLink>

          <NavLink
            to="/key-monitor"
            className={({ isActive }) =>
              `flex items-center w-full ${
                showExpanded ? "justify-start px-4" : "justify-center px-2"
              } gap-3 py-2.5 rounded-md transition-all duration-200 relative
              ${isActive ? "text-menuActive" : "text-gray-300 hover:text-menuActive"}`
            }
          >
            <FiList size={16} className="flex-shrink-0" />
            {/* Only show text when expanded */}
            <span
              className={`
                text-[15px] font-normal whitespace-nowrap
                transition-all duration-200
                ${showExpanded ? "inline-block opacity-100" : "hidden"}
              `}
            >
              Key Monitor
            </span>
          </NavLink>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 duration-200 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 min-w-0 bg-gray-white transition-all duration-300
  ${
    isMobile
      ? ""
      : sidebarOpen
        ? "ml-72 md:ml-80 lg:ml-[260px]"
        : isHovering
          ? "ml-72 md:ml-80 lg:ml-[260px]"
          : "ml-20"
  }`}
      >
        <Header />

        <div className="flex flex-col flex-1">
          {/* Content */}
          <main className="flex-1 p-4 overflow-y-auto md:px-6 md:py-6 lg:px-8 lg:py-2">
            <div className="">
              <Breadcrumb />
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-[#2A374D] transition-all duration-200 md:hidden"
        >
          <FiMenu size={24} />
        </button>
      )}
    </div>
  );
};

export default AdminLayout;
