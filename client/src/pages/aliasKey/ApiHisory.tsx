import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
interface ApiHistoryItem {
  _id: string;

  user_id?: {
    first_name: string;
    email: string;
  };

  user_alias_key_id?: {
    alias_key: string;
  };

  request_info: {
    method: string;
    url: string;
  };

  response: {
    success: boolean;
    message: string;
  };

  status: "Success" | "Fail";
  execution_time: string;
  createdAt: string;
}

const ApiHistory: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ApiHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // ✅ Fetch API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/api-hisory", {
        params: {
          page,
          limit: perPage,
          search,
          sortBy,
          order,
        },
      });

      //   const res = await apiClient.get("http://localhost:5001/api/api-hisory", {
      //     params: {
      //       page,
      //       limit: perPage,
      //       search,
      //       sortBy,
      //       order,
      //     },
      //   });

      setData(res.data.data);
      setTotalRows(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, sortBy, order]);
  alert(user?.role);
  // ✅ Columns
  const columns: TableColumn<ApiHistoryItem>[] = [
    // ✅ Show user only if Admin
    ...(user?.role === "Admin"
      ? [
          {
            name: "User",
            cell: (row: ApiHistoryItem) => (
              <div className="text-sm">
                <div className="font-medium text-gray-800">
                  {row.user_id?.first_name}
                </div>
                <div className="text-xs text-gray-500">
                  {row.user_id?.email}
                </div>
              </div>
            ),
          },
        ]
      : []),

    {
      name: "Alias Key",
      selector: (row) => row.user_alias_key_id?.alias_key || "-",
      wrap: true,
    },

    {
      name: "Method",
      selector: (row) => row.request_info.method,
      sortable: true,
      sortField: "request_info.method",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.request_info.method === "GET"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {row.request_info.method}
        </span>
      ),
    },

    {
      name: "URL",
      selector: (row) => row.request_info.url,
      wrap: true,
    },

    {
      name: "Response",
      selector: (row) => row.response.message,
      cell: (row) => (
        <span className="text-sm text-gray-700">{row.response.message}</span>
      ),
    },

    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      sortField: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.status === "Success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },

    {
      name: "Time",
      selector: (row) => row.execution_time,
      sortable: true,
      sortField: "execution_time",
    },

    {
      name: "Date",
      selector: (row) => row.createdAt,
      sortable: true,
      sortField: "createdAt",
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  // ✅ Handle sorting
  const handleSort = (column: any, sortDirection: "asc" | "desc") => {
    setSortBy(column.sortField); // ✅ correct field
    setOrder(sortDirection);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="p-4 bg-white shadow-md rounded-2xl md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-gray-800">API History</h2>

          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 text-sm border rounded-lg md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          onChangePage={(page) => setPage(page)}
          onSort={handleSort}
          sortServer
          highlightOnHover
          responsive
          striped
          customStyles={{
            headCells: {
              style: {
                fontWeight: "600",
                fontSize: "12px",
                textTransform: "uppercase",
              },
            },
            rows: {
              style: {
                minHeight: "56px",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ApiHistory;
