import React, { useEffect, useState, useRef, useMemo } from "react";
import { Key } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router";
import type { IAliasKey } from "../../interface/aliasKey.interface";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const schema = yup.object().shape({
  domain_name: yup.string().required("Domain name is required"),
  proxy_id: yup.string().required("proxy is required"),

  total_quota: yup
    .number()
    .transform((value, originalValue) => {
      // ✅ handle empty, null, NaN
      if (
        originalValue === "" ||
        originalValue === null ||
        Number.isNaN(value)
      ) {
        return undefined;
      }
      return value;
    })
    .required("Total quota is required") // ✅ FIRST
    .typeError("Total quota must be a number") // ✅ SECOND
    .positive("Total quota must be greater than 0")
    .integer("Total quota must be an integer"),
  cost_calculation: yup.string().required("Cost calculation is required"),
  total_estimated_cost: yup
    .number()
    .transform((value, originalValue) => {
      // ✅ handle empty, null, NaN
      if (
        originalValue === "" ||
        originalValue === null ||
        Number.isNaN(value)
      ) {
        return undefined;
      }
      return value;
    })
    .required("Total estimated cost is required") // ✅ FIRST
    .typeError("Total estimated cost must be a number") // ✅ SECOND
    .positive("Total estimated cost must be greater than 0")
    .integer("Total estimated cost must be an integer"),
  description: yup.string().optional(),
});

function AliasKeyAdd() {
  const { id } = useParams();
  const topRef = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState("add");
  const [proxies, setProxies] = useState<any[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<IAliasKey>({
    resolver: yupResolver(schema),
    defaultValues: {
      project_name: "",
      domain_name: "",
      proxy_id: "",
      description: "",
      cost_calculation: "",
    },
  });
  const proxyOptions = useMemo(() => {
    return proxies.map((p) => ({
      value: p._id,
      label: `${p.proxy_name} (${p.curl})`,
    }));
  }, [proxies]);
  useEffect(() => {
    const fetchProxies = async () => {
      try {
        const res = await apiClient.get("/api/proxy/get-list");
        setProxies(res.data.data);
      } catch (err: any) {
        toast.error("Failed to load proxies");
      }
    };

    fetchProxies();
  }, []);
  useEffect(() => {
    if (!id) {
      // ✅ ADD MODE → RESET FORM
      setMode("add");
      reset({
        project_name: "",
        domain_name: "",
        proxy_id: "",
        cost_calculation: "",
        total_estimated_cost: undefined,
        total_quota: undefined,
        description: "",
      });
      return; // 🚀 IMPORTANT (stop execution)
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(
          BACKEND_URL + `/api/alias-key/${id}`,
        );
        Object.entries(data.data).forEach(([k, v]) =>
          setValue(k as keyof IAliasKey, v),
        );
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setValue]);

  useEffect(() => {
    if (id) setMode("edit");
  }, [id]);

  useEffect(() => {
    if (errors) {
      const firstError = Object.values(errors)[0];
      if (firstError?.message) {
        toast.error(firstError.message as string);
      }
    }
  }, [errors]);

  const onSubmit = async (data: IAliasKey) => {
    setLoading(true);
    try {
      const send_data = {
        project_name: data.project_name,
        domain_name: data.domain_name,
        proxy_id: data.proxy_id,
        cost_calculation: data.cost_calculation,
        total_quota: Number(data.total_quota),
        total_estimated_cost: Number(data.total_estimated_cost),
        description: data.description,
      };
      let res: any;

      if (mode === "add") {
        res = await apiClient.post("/api/alias-key", send_data);
      } else {
        res = await apiClient.put(
          BACKEND_URL + "/api/alias-key/" + id,
          send_data,
        );
      }
      toast.success(res.data.message);
      navigate("/alias-key");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );

      window.scrollTo({ top: 0, behavior: "smooth" });

      requestAnimationFrame(() => {
        topRef.current?.focus();
      });
    } finally {
      setLoading(false);
    }
  };
  const totalQuotaValue = watch("total_quota");

  return (
    <div className="py-4">
      <div>
        {/* Card */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl ">
          {/* Header */}
          <div className="px-2 py-3 border border-gray-200 bg-gray-50 sm:px-8 ">
            <div className="flex items-center gap-3 ">
              <div className="flex items-center justify-center w-10 h-10 ">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2
                  ref={topRef}
                  className="text-xl font-semibold tracking-tight text-gray-800 sm:text-2xl"
                >
                  {mode === "add" ? "Add Key" : "Edit Key"}
                </h2>
                <p className="mt-1 text-base">
                  {mode === "add"
                    ? "Add a new key to your collection"
                    : "Update your key information"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
            <div
              className={`space-y-6 transition-opacity duration-200 ${
                loading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {/* project_name */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Project Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    disabled={mode === "edit"}
                    autoFocus
                    type="text"
                    placeholder="e.g., example.com"
                    {...register("project_name")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.project_name
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              {/* Domain Field */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Domain Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g., example.com"
                    {...register("domain_name")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.domain_name
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>

              {/* Proxy Select Field */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Proxy <span className="text-red-500">*</span>
                </label>

                <Select
                  options={proxyOptions}
                  isDisabled={mode === "edit"}
                  placeholder="Search and select proxy..."
                  isSearchable
                  onChange={(selected: any) => {
                    setValue("proxy_id", selected?.value);
                  }}
                  value={proxyOptions.find(
                    (opt) => opt.value === watch("proxy_id"),
                  )}
                  className="text-sm"
                />
              </div>
              {/* Total Quota Field */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Total Quota <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    type="text"
                    disabled={mode === "edit"}
                    placeholder="Enter total quota"
                    {...register("total_quota", { valueAsNumber: true })}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, ""); // keep only numbers
                      setValue("total_quota", val); // ✅ correct usage
                    }}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.total_quota
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              {/* cost_calculation */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Cost Calculation <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    type="text"
                    disabled={mode === "edit"}
                    placeholder="Enter cost_calculation"
                    {...register("cost_calculation")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.cost_calculation
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              {/* total_estimated_cost */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Total Estimated Cost <span className="text-red-500">*</span>
                </label>
                <div>
                  <input
                    type="text"
                    disabled={mode === "edit"}
                    placeholder="Enter total quota"
                    {...register("total_estimated_cost", {
                      valueAsNumber: true,
                    })}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, ""); // keep only numbers
                      setValue("total_estimated_cost", val); // ✅ correct usage
                    }}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.total_estimated_cost
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              {/* Description Field */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Purpose / Description
                </label>
                <div className="relative">
                  <div className="absolute pointer-events-none top-3 left-3"></div>
                  <textarea
                    rows={4}
                    placeholder="Describe the purpose of this key..."
                    {...register("description")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-y ${
                      errors.description
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              {mode == "edit" && (
                <div>
                  <label className="block mb-2 text-base font-semibold text-gray-700">
                    Proxy Permission Required
                  </label>
                  <div> {getValues("proxy_permission_required")}</div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex flex-col justify-center gap-3 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>{mode === "add" ? "Add" : "Update"}</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/alias-key")}
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Fields marked with <span className="text-red-500">*</span> are
            required
          </p>
        </div>
      </div>
    </div>
  );
}

export default AliasKeyAdd;
