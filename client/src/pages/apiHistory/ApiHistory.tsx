import { Link, useLocation, useNavigate } from "react-router-dom";
import { capitalize, getStatusConfig } from "../../utils/CommonFn";
import React, { useEffect, useState, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { FiList } from "react-icons/fi";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { customTableStyles } from "../datatableDesign";
const ApiHistory = () => {
  const navigate = useNavigate();

  const { aliasKeyId } = useParams(); // 🔥 from URL

  const controllerRef = useRef<AbortController | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [keyData, setKeyData] = useState("");

  const [sort, setSort] = useState({
    field: "createdAt",
    order: "desc" as "asc" | "desc",
  });

  // 🔥 debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // 🔥 API CALL
  const fetchData = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);

    try {
      const { data } = await apiClient.get(`${BACKEND_URL}/api/api-history`, {
        signal: controller.signal,
        params: {
          page,
          limit,
          search: debouncedSearch,
          sortField: sort.field,
          sortOrder: sort.order,
          user: selectedUser,
          alias_key: aliasKeyId, // 🔥 key filter
          status,
        },
      });

      setData(data.data);
      setKeyData(data.aliasKeysList);
      console.log(data);
      setTotal(data.pagination.total);
    } catch (err: any) {
      if (err.name !== "CanceledError") {
        toast.error(err?.message || "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sort, selectedUser, status, aliasKeyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔥 sorting
  const handleSort = (column: any, direction: "asc" | "desc") => {
    if (!column.sortField) return;

    setSort((prev) => {
      if (prev.field === column.sortField && prev.order === direction) {
        return prev;
      }
      return { field: column.sortField, order: direction };
    });

    setPage(1);
  };

  // 🔥 columns
  const columns = [
    {
      name: "No.",
      cell: (_: any, index: number) => (page - 1) * limit + index + 1,
      width: "70px",
    },
    {
      name: "Method",
      selector: (row: any) => row.method,
      sortable: true,
      sortField: "method",
      width: "100px",
    },
    {
      name: "Status",
      selector: (row: any) => row.response_status,
      sortable: true,
      sortField: "response_status",
      cell: (row: any) => {
        const status = row.response_status?.toLowerCase();
        const statusConfig = getStatusConfig(status);

        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}
          >
            {capitalize(row.response_status) || "-"}
          </span>
        );
      },
      width: "120px",
    },
    {
      name: "Code",
      selector: (row: any) => row.response_code,
      sortable: true,
      sortField: "response_code",
    },
    {
      name: "Execution Time",
      selector: (row: any) => row.execution_time,
      sortable: true,
      sortField: "execution_time",
      cell: (row: any) => <>{row.execution_time}ms</>,
    },
    {
      name: "Created",
      selector: (row: any) => row.createdAt,
      sortable: true,
      width: "120px",

      sortField: "createdAt",
      cell: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <button
          onClick={() => navigate(`/api-history/view/${row._id}`)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Details"
        >
          <FiList className="w-4 h-4" />
        </button>
      ),
      width: "100px",
    },
  ];

  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-md shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-3 bg-primary">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Accent line touching left border */}
          <div className="w-1 h-6 -ml-6 rounded-r-full bg-menuActive" />

          {/* Title */}
          <div>
            <h5 className=" sm:text-xl text-white/60">
              Key Monitoring History for
            </h5>
          </div>
        </div>
      </div>
      {/* 🔍 Filters */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border rounded"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "" | "success" | "fail");
              setPage(1);
            }}
            className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="fail">Fail</option>
          </select>
        </div>
        <div className="overflow-hidden ">
          <div className="overflow-hidden bordershadow-sm rounded-xl">
            {/* 📊 DataTable */}
            <DataTable
              columns={columns}
              data={data}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={total}
              paginationPerPage={limit}
              onChangePage={(p) => setPage(p)}
              onChangeRowsPerPage={(l) => {
                setLimit(l);
                setPage(1);
              }}
              sortServer
              onSort={handleSort}
              highlightOnHover
              customStyles={customTableStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiHistory;
