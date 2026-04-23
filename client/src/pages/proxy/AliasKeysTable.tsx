import React, { useState, useMemo } from "react";

const AliasKeysTable = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Filter data based on search - with null checks
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    if (!searchTerm.trim()) return data;

    return data.filter((item) => {
      // Safely get values with fallbacks
      const aliasKey = item?.alias_key || "";
      const approval_status = item?.approval_status || "";
      const keyStatus = item?.key_status || "";
      const searchLower = searchTerm.toLowerCase();

      return (
        aliasKey.toLowerCase().includes(searchLower) ||
        approval_status.toLowerCase().includes(searchLower) ||
        keyStatus.toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchTerm]);

  // Sort data - with null checks
  const sortedData = useMemo(() => {
    if (!filteredData || !Array.isArray(filteredData)) return [];

    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      // Handle date fields
      if (sortField === "createdAt") {
        aValue = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      }
      // Handle number fields
      else if (sortField === "api_history_count") {
        aValue = a?.api_history_count || 0;
        bValue = b?.api_history_count || 0;
      }
      // Handle string fields with null checks
      else {
        aValue = aValue ? String(aValue).toLowerCase() : "";
        bValue = bValue ? String(bValue).toLowerCase() : "";
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Change page
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Don't render if no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No alias keys found</p>
      </div>
    );
  }

  return (
    <div className=" rounded-lg overflow-hidden">
      {/* Search Bar */}
      {/* <div className="p-3 bg-white border-b border-gray-200">
        <input
          type="text"
          placeholder="🔍 Search by alias key, status..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div> */}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("alias_key")}
              >
                <div className="flex items-center gap-1">
                  Alias Key
                  <span className="text-gray-400">
                    {getSortIndicator("alias_key")}
                  </span>
                </div>
              </th>
              <th
                className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("approval_status")}
              >
                <div className="flex items-center gap-1">
                  approval_status
                  <span className="text-gray-400">
                    {getSortIndicator("approval_status")}
                  </span>
                </div>
              </th>
              <th
                className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("key_status")}
              >
                <div className="flex items-center gap-1">
                  Key Status
                  <span className="text-gray-400">
                    {getSortIndicator("key_status")}
                  </span>
                </div>
              </th>
              <th
                className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("api_history_count")}
              >
                <div className="flex items-center gap-1">
                  API Calls
                  <span className="text-gray-400">
                    {getSortIndicator("api_history_count")}
                  </span>
                </div>
              </th>
              <th
                className="p-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  Created
                  <span className="text-gray-400">
                    {getSortIndicator("createdAt")}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((item) => (
              <tr
                key={item?._id || Math.random()}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 font-mono text-sm text-gray-700">
                  {item?.alias_key || "-"}
                </td>
                <td className="p-3">
                  <StatusBadge status={item?.approval_status} />
                </td>
                <td className="p-3">
                  <StatusBadge status={item?.key_status} />
                </td>
                <td className="p-3">
                  <span className="font-medium text-gray-700">
                    {item?.api_history_count || 0}
                  </span>
                </td>
                <td className="p-3 text-gray-500 text-sm">
                  {item?.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            {searchTerm
              ? "No matching alias keys found"
              : "No alias keys found"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {filteredData.length > 0 && totalPages > 1 && (
        <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// StatusBadge component with null check
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Approved: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    Pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
    },
    Rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    Active: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    Inactive: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {status || "-"}
    </span>
  );
};

export default AliasKeysTable;
