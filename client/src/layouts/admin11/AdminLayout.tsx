import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FiHome,
  FiUpload,
  FiKey,
  FiMenu,
  FiMaximize2, // Add this for expand icon
} from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { MdClose } from "react-icons/md";

import logo from "../../assets/actowizLogo.svg";
import Header from "../../layouts/user/Header";
import Footer from "../../layouts/user/Footer";
import Breadcrumb from "../../components/Breadcrumb";

const AdminLayout = () => {
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
          bg-primary text-gray-200 flex flex-col shadow-2xl
          transition-all duration-300 ease-in-out
         ${
           isMobile
             ? `fixed top-0 left-0 h-full z-50 w-64 transform ${
                 sidebarOpen ? "translate-x-0" : "-translate-x-full"
               }`
             : sidebarOpen
               ? "w-72 md:w-80 lg:w-[260px]" // Responsive widths
               : isHovering
                 ? "w-72 md:w-80 lg:w-[260px]" // Responsive on hover
                 : "w-20" // Collapsed
         }
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-24 px-4 bg-primary">
          <div className="flex items-center gap-3 w-full">
            {/* Logo Icon */}
            <div className="flex items-center justify-center w-16 h-16 overflow-hidden rounded-full bg-white flex-shrink-0">
              <img
                src={logo}
                alt="App logo"
                className="object-contain w-full h-full scale-125"
              />
            </div>

            {/* Text and Icons Container */}
            <div
              className={`
                flex items-center justify-between flex-1
                overflow-hidden transition-all duration-300
                ${
                  showExpanded
                    ? "max-w-full opacity-100 translate-x-0"
                    : "max-w-0 opacity-0 -translate-x-2"
                }
              `}
            >
              <div className="flex flex-col w-full">
                <span className="m-0 font-bold uppercase text-4xl leading-snug text-left">
                  Actowiz
                </span>
                <span className="text-lg text-white font-medium text-left">
                  Alias Key Management
                </span>
              </div>

              {/* Icons Section - Always show expand/collapse buttons */}
              <div className="flex items-center gap-2">
                {/* Show Close icon when sidebar is pinned open */}
                {sidebarOpen && !isMobile && (
                  <IoClose
                    size={24}
                    onClick={toggleSidebar}
                    className="cursor-pointer text-gray-300 hover:brightness-90 transition-all duration-200"
                  />
                )}

                {/* Show Expand icon when sidebar is collapsed - ALWAYS VISIBLE */}
                {!sidebarOpen && !isMobile && (
                  <FiMaximize2
                    size={22}
                    onClick={toggleSidebar}
                    className="cursor-pointer text-gray-300 hover:text-primary flex-shrink-0 transition-all duration-200"
                    title="Expand sidebar"
                  />
                )}

                {/* Show Close icon on mobile when sidebar is open */}
                {isMobile && sidebarOpen && (
                  <MdClose
                    size={22}
                    onClick={() => setSidebarOpen(false)}
                    className="cursor-pointer text-gray-300 hover:text-menuActive flex-shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={`
            flex-1 py-6 space-y-1
            transition-all duration-300
            ${showExpanded ? "overflow-y-auto" : "overflow-visible"}
          `}
        >
          {/* Dashboard Link */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center w-full ${
                showExpanded ? "justify-start px-4" : "justify-center px-2"
              } gap-3 py-2.5 rounded-md transition-all duration-200 relative
              ${isActive ? "text-menuActive" : "text-gray-300 hover:text-menuActive"}`
            }
          >
            <FiHome size={22} className="flex-shrink-0" />
            {/* Only show text when expanded */}
            <span
              className={`
                text-xl font-normal whitespace-nowrap
                transition-all duration-200
                ${showExpanded ? "inline-block opacity-100" : "hidden"}
              `}
            >
              Dashboard
            </span>
          </NavLink>

          {/* Upload File Link */}
          <NavLink
            to="/alias-key"
            className={({ isActive }) =>
              `flex items-center w-full ${
                showExpanded ? "justify-start px-4" : "justify-center px-2"
              } gap-3 py-2.5 rounded-md transition-all duration-200 relative
              ${isActive ? "text-menuActive" : "text-gray-300 hover:text-menuActive"}`
            }
          >
            <FiKey size={22} className="flex-shrink-0" />
            {/* Only show text when expanded */}
            <span
              className={`
                text-xl font-normal whitespace-nowrap
                transition-all duration-200
                ${showExpanded ? "inline-block opacity-100" : "hidden"}
              `}
            >
              Alias Key Request
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
      <div className="flex flex-col flex-1 min-w-0 bg-gray-white">
        <Header />

        <div className="flex flex-col flex-1">
          {/* Content */}
          <main className="flex-1 p-4 overflow-y-auto md:p-6 lg:p-8">
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
