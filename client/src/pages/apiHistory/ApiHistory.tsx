import { Link, useLocation, useNavigate } from "react-router-dom";
import { capitalize, getStatusConfig } from "../../utils/CommonFn";
import React, { useEffect, useState, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";
import { FiEye, FiList, FiSearch } from "react-icons/fi";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import { customTableStyles } from "../datatableDesign";
import { MdClose } from "react-icons/md";
const ApiHistory = () => {
  const navigate = useNavigate();

  const { aliasKeyId } = useParams<{ aliasKeyId: string }>();

  const controllerRef = useRef<AbortController | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAliasKey, setSelectedAliasKey] = useState(aliasKeyId || "");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [aliasKeyName, setAliasKeyName] = useState("");
  const [status, setStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [keyData, setKeyData] = useState("");

  const [sort, setSort] = useState({
    field: "createdAt",
    order: "desc" as "asc" | "desc",
  });
  // useEffect(() => {
  //   if (searchRef.current) {
  //     searchRef.current.focus();
  //   }
  // }, [data]);
  useEffect(() => {
    if (aliasKeyId) {
      setSelectedAliasKey(aliasKeyId);
    } else {
      setSelectedAliasKey("");
    }
  }, [aliasKeyId, location.pathname]);
  useEffect(() => {
    const loadAliasKeyName = async () => {
      if (!aliasKeyId) {
        setAliasKeyName("");
        return;
      }
      //setLoading(true);
      try {
        const { data } = await apiClient.get(
          `${BACKEND_URL}/api/alias-key/${aliasKeyId}`,
        );
        //alert(data.data?.alias_key);
        setAliasKeyName(data.data?.alias_key || "");
      } catch (error) {
        setAliasKeyName("");
      } finally {
        setLoading(false);
      }
    };

    loadAliasKeyName();
  }, [aliasKeyId]);
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
    },
    {
      name: "Method",
      selector: (row: any) => row.method,
      sortable: true,
      sortField: "method",
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
      cell: (row: any) => <>{row.execution_time}</>,
    },
    {
      name: "Created",
      selector: (row: any) => row.createdAt,
      sortable: true,

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
          onClick={() => {
            navigate(`/api-history/view/${row._id}`, {
              state: { historyParentId: aliasKeyId },
            });
          }}
          className="p-1.5  text-blue-600 hover:text-white hover:bg-blue-500  rounded-lg transition-colors"
          title="View Details"
        >
          <FiEye className="w-4 h-4" />
        </button>
      ),
    },
  ];
  const isFilterActive = search || status;
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
              Key Monitor History{aliasKeyName ? ` - ${aliasKeyName}` : ""}
            </h5>
          </div>
        </div>
      </div>
      {/* 🔍 Filters */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-end sm:gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by request, time, status, message, code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
            />
            <FiSearch className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <MdClose size={16} />
              </button>
            )}
          </div>

          {/* Status */}
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

          {/* Clear Button (NOW NEXT TO DROPDOWN ✅) */}
          <button
            onClick={() => {
              setSearch("");
              setStatus("");
              searchRef.current?.focus();
              setDebouncedSearch("");
              setPage(1);
            }}
            className="px-4 py-3 text-xs font-medium bg-white border rounded-lg text-primary border-primary hover:bg-primary hover:text-white"
          >
            Clear
          </button>
        </div>
        <div className="overflow-hidden">
          <div className="overflow-hidden shadow-sm rounded-xl">
            <div className="w-full data-table-responsive">
              {/* 📊 DataTable */}
              <DataTable
                key={`${debouncedSearch}-${status}`}
                columns={columns}
                data={data}
                // progressPending={loading}
                pagination
                paginationServer
                paginationDefaultPage={page}
                paginationTotalRows={total}
                paginationPerPage={limit}
                paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
                onChangePage={(p) => setPage(p)}
                onChangeRowsPerPage={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                sortServer
                onSort={handleSort}
                highlightOnHover
                pointerOnHover
                customStyles={{
                  ...customTableStyles,
                  table: {
                    style: {
                      width: "100%",
                    },
                  },
                  rows: {
                    style: {
                      cursor: "pointer",
                    },
                  },
                  cells: {
                    style: {
                      pointerEvents: "auto", // ✅ ensures clicks bubble
                    },
                  },
                }}
                responsive
                onRowClicked={(row) =>
                  navigate(`/api-history/view/${row._id}`, {
                    state: { historyParentId: aliasKeyId },
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            {/* Pulsing Circle */}
            <div className="w-12 h-12 border-4 rounded-full border-primary/30 border-t-primary animate-spin"></div>

            {/* Animated Text */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700">Loading</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 rounded-full bg-primary animate-bounce"></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiHistory;
