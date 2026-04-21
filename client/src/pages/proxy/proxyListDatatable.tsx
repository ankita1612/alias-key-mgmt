import React, { useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import apiClient from "../../services/apiClient";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProxyList = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sort, setSort] = useState({
    field: "createdAt",
    order: "desc" as "asc" | "desc",
  });

  const controllerRef = useRef<AbortController | null>(null);

  // 🔥 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // 🔥 Fetch data
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(BACKEND_URL + "/api/proxy", {
          signal: controller.signal,
          params: {
            page,
            limit,
            search: debouncedSearch,
            sortField: sort.field,
            sortOrder: sort.order,
          },
        });

        setData(data.data);
        setTotal(data.pagination.total);
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          toast.error(err?.message || "Error fetching data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [page, limit, debouncedSearch, sort.field, sort.order]);

  // 🔥 Handle sort
  const handleSort = (column: any, sortDirection: "asc" | "desc") => {
    if (!column.sortField) return;

    setSort((prev) => {
      if (prev.field === column.sortField && prev.order === sortDirection) {
        return prev;
      }

      return {
        field: column.sortField,
        order: sortDirection,
      };
    });

    setPage(1);
  };

  // 🔥 Columns
  const columns = [
    {
      name: "No.",
      cell: (_: any, index: number) => (page - 1) * limit + index + 1,
      width: "70px",
    },
    {
      name: "Proxy Name",
      selector: (row: any) => row.proxy_name,
      sortable: true,
      sortField: "proxy_name",
    },
    {
      name: "Curl",
      selector: (row: any) => row.curl,
      sortable: true,
      sortField: "curl",
      cell: (row: any) => (
        <div className="truncate max-w-[250px]">{row.curl}</div>
      ),
    },
    {
      name: "Credit",
      selector: (row: any) => row.credit,
      sortable: true,
      sortField: "credit",
    },
    {
      name: "Created",
      selector: (row: any) => row.createdAt,
      sortable: true,
      sortField: "createdAt",
      cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      name: "Actions",
      cell: (row: any) => <button className="text-blue-600">View</button>,
      ignoreRowClick: true,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search proxy..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 mb-4 border rounded w-80"
      />

      {/* 📊 Table */}
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={total}
        paginationPerPage={limit}
        onChangePage={(p) => setPage(p)}
        onChangeRowsPerPage={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        sortServer
        onSort={handleSort}
        highlightOnHover
        pointerOnHover
      />
    </div>
  );
};

export default ProxyList;
