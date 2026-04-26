import DescriptionEditor from "./DescriptionEditor";
import { showToast } from "../../utils/CustomToast";
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
  project_name: yup.string().required("Project Name is required"),
  domain_name: yup
    .string()
    .trim()
    .required("Domain Name is required")
    .matches(/[a-zA-Z]/, "Must contain at least 1 letter or number")
    .max(200, "Maximum 200 characters allowed"),
  proxy_id: yup.string().required("Proxy Name is required"),

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
    .required("Total Quota is required") // ✅ FIRST
    .typeError("Total Quota must be a number") // ✅ SECOND
    .positive("Total Quota must be greater than 0")
    .max(10_000_000, "Total Quota must be less then or equal to 10 million")
    .integer("Total Quota must be an integer"),
  cost_calculation: yup.string().required("Cost Calculation is required"),
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
    .required("Total Estimated cost is required") // ✅ FIRST
    .typeError("Total Estimated cost must be a number") // ✅ SECOND
    .positive("Total Estimated cost must be greater than 0")
    .max(
      1_000_000_000,
      "Total Estimated Cost must be less than or equal to 100 crore",
    )
    .integer("Total Estimated Cost must be an integer"),
  description: yup
    .string()
    .nullable()
    .transform((val) => (val === "<p><br></p>" ? "" : val)),
});

function AliasKeyAdd() {
  const { id } = useParams();
  const topRef = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState("add");
  const [proxies, setProxies] = useState<any[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState<IAliasKey | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isDirty },
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
  const descriptionValue = watch("description");
  const proxyOptions = useMemo(() => {
    return proxies.map((p) => ({
      value: p._id,
      label: `${p.proxy_name}`,
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
        reset({
          project_name: data.data.project_name || "",
          domain_name: data.data.domain_name || "",
          proxy_id: data.data.proxy_id || "",
          cost_calculation: data.data.cost_calculation || "",
          total_quota: data.data.total_quota,
          total_estimated_cost: data.data.total_estimated_cost,
          description: data.data.description || "",
          proxy_permission_required: data.data.proxy_permission_required || "",
        });
        setOriginalData(data.data);
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

  // useEffect(() => {
  //   if (errors) {
  //     const firstError = Object.values(errors)[0];
  //     if (firstError?.message) {
  //       toast.error(firstError.message as string);
  //     }
  //   }
  // }, [errors]);

  const onSubmit = async (data: IAliasKey) => {
    try {
      if (mode === "edit" && !isDirty) {
        showToast("No changes detected to update.", "info");
        return;
      }

      setLoading(true);
      const cleanDescription =
        data.description === "<p><br></p>" ? "" : data.description;
      const send_data = {
        project_name: data.project_name,
        domain_name: data.domain_name,
        proxy_id: data.proxy_id,
        cost_calculation: data.cost_calculation,
        total_quota: Number(data.total_quota),
        total_estimated_cost: Number(data.total_estimated_cost),
        description: cleanDescription,
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
              {" "}
              {mode === "add" ? "Add Key" : "Edit Key"}
            </h5>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:px-6 sm:py-8">
        <div
          className={`space-y-6 transition-opacity duration-200 ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {/* project_name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm">
                Project Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                <input
                  disabled={mode === "edit"}
                  autoFocus
                  type="text"
                  maxLength={200}
                  placeholder="e.g., Ecommerce Scraper / Lead Generation"
                  {...register("project_name")}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
 ${
   errors.project_name
     ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
     : "border-gray-300 focus:ring-primary/20 focus:border-primary"
 }`}
                />
                {errors.project_name && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.project_name.message}
                  </p>
                )}
              </div>
            </div>
            {/* Domain Field */}
            <div>
              <label className="block mb-2 text-sm">
                Domain Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="e.g., example.com"
                  {...register("domain_name")}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                    errors.domain_name
                      ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                      : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                  }`}
                />
              </div>
              {errors.domain_name && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.domain_name.message}
                </p>
              )}
            </div>
          </div>
          {/* Proxy Select Field */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm">
                Proxy Name <span className="text-red-500">*</span>
              </label>

              <Select
                options={proxyOptions}
                isDisabled={mode === "edit"}
                placeholder="Select Proxy"
                isSearchable
                onChange={(selected: any) => {
                  setValue("proxy_id", selected?.value);
                }}
                value={proxyOptions.find(
                  (opt) => opt.value === watch("proxy_id"),
                )}
                className="text-sm"
              />
              {errors.proxy_id && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.proxy_id.message}
                </p>
              )}
            </div>
            {/* Total Quota Field */}
            <div>
              <label className="block mb-2 text-sm">
                Total Quota <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="text"
                  disabled={mode === "edit"}
                  placeholder="Enter total request quota (e.g., 10,000 requests)"
                  {...register("total_quota", { valueAsNumber: true })}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, ""); // keep only numbers
                    setValue("total_quota", val); // ✅ correct usage
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
 ${
   errors.total_quota
     ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
     : "border-gray-300 focus:ring-primary/20 focus:border-primary"
 }`}
                />
              </div>
              {errors.total_quota && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.total_quota.message}
                </p>
              )}
            </div>
            {/* total_estimated_cost */}
            <div>
              <label className="block mb-2 text-sm">
                Total Estimated Cost <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="text"
                  disabled={mode === "edit"}
                  placeholder="Enter Total Estimated Cost"
                  {...register("total_estimated_cost", {
                    valueAsNumber: true,
                  })}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, ""); // keep only numbers
                    setValue("total_estimated_cost", val); // ✅ correct usage
                  }}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
 ${
   errors.total_estimated_cost
     ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
     : "border-gray-300 focus:ring-primary/20 focus:border-primary"
 }`}
                />
                {errors.total_estimated_cost && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.total_estimated_cost.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* cost_calculation */}
          <div>
            <label className="block mb-2 text-sm">
              Cost Calculation <span className="text-red-500">*</span>
            </label>
            <div>
              <textarea
                rows={4}
                placeholder="Define cost per request or formula (e.g., ₹0.01 per request)"
                {...register("cost_calculation")}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                  errors.cost_calculation
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                }`}
              />
            </div>
            {errors.cost_calculation && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.cost_calculation.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block mb-2 text-sm">
              Purpose / Description (Optional)
            </label>

            {/* <div className="border border-gray-900 rounded-xl overflow-hidden  focus-within:ring-primary/20 transition"> */}
            <div className="rounded-xl bg-white border text-slate-900 transition text-sm  border-gray-300 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
              <DescriptionEditor
                key={id || "new"}
                value={watch("description")}
                onChange={(val: string) =>
                  setValue("description", val, { shouldDirty: true })
                }
              />
            </div>
          </div>
          {mode == "edit" && (
            <div>
              <label className="block mb-2 text-sm">
                Proxy Permission Required
              </label>
              <div> {getValues("proxy_permission_required")}</div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col justify-end gap-3 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/alias-key")}
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-primary px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Saving...</>
              ) : (
                <>{mode === "add" ? "Add" : "Update"}</>
              )}
            </button>
          </div>
        </div>
      </form>
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
}

export default AliasKeyAdd;
