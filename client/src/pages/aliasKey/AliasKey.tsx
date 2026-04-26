import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AliasKeyList from "./AliasKeyList";
import { FiArchive, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

function AliasKey() {
  const { user } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab based on URL path
  const getActiveTabFromPath = () => {
    if (location.pathname.includes("alias-key/archived-alias-key")) {
      return "deleted";
    }
    return "active";
  };

  const [activeTab, setActiveTab] = useState<"active" | "deleted">(
    getActiveTabFromPath(),
  );

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: "active" | "deleted") => {
    setActiveTab(tab);

    // Navigate to the appropriate URL
    if (tab === "deleted") {
      navigate("/alias-key/archived-alias-key");
    } else {
      navigate("/alias-key");
    }
  };
  const isAdmin = user?.role === "Admin";
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl">
      {/* Tabs only for Admin */}
      {isAdmin && (
        <div className="px-6 pt-4 pb-0">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => handleTabChange("active")}
              className={`
            relative pb-3 text-sm font-medium transition-all duration-200
            flex items-center gap-2
            ${
              activeTab === "active"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
            >
              <FiArchive className="w-4 h-4" />
              <span>Active Key Management</span>

              {activeTab === "active" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => handleTabChange("deleted")}
              className={`
            relative pb-3 text-sm font-medium transition-all duration-200
            flex items-center gap-2
            ${
              activeTab === "deleted"
                ? "text-primary"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Archived Key Management</span>

              {activeTab === "deleted" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {isAdmin ? (
          <>
            {activeTab === "active" && (
              <AliasKeyList alias_key_status="active" />
            )}
            {activeTab === "deleted" && (
              <AliasKeyList alias_key_status="deleted" />
            )}
          </>
        ) : (
          <AliasKeyList alias_key_status="active" />
        )}
      </div>
    </div>
  );
}

export default AliasKey;
