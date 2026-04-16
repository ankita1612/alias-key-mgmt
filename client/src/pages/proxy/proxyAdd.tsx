import React, { useEffect, useState, useRef } from "react";
import { Key } from "lucide-react";

import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router";
import type { IProxy } from "../../interface/proxy.interface";
import { FaExchangeAlt } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const schema = yup.object().shape({
  proxy_name: yup.string().required("Proxy name is required"),
  proxy_token: yup.string().required("Proxy token is required"),
  curl: yup.string().required("Curl is required"),
});

function ProxyAdd() {
  const { id } = useParams();
  const topRef = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState("add");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<IProxy>({
    resolver: yupResolver(schema),
    defaultValues: {
      proxy_name: "",
      proxy_token: "",
      curl: "",
      domain_name: "",
      project_name: "",
    },
  });

  useEffect(() => {
    if (!id) {
      // ✅ ADD MODE → RESET FORM
      setMode("add");
      reset({
        proxy_name: "",
        proxy_token: "",
        curl: "",
        domain_name: "",
        project_name: "",
      });
      return; // 🚀 IMPORTANT (stop execution)
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(BACKEND_URL + `/api/proxy/${id}`);
        Object.entries(data.data).forEach(([k, v]) =>
          setValue(k as keyof IProxy, v),
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

  const onSubmit = async (data: IProxy) => {
    setLoading(true);
    try {
      const send_data = {
        proxy_name: data.proxy_name,
        proxy_token: data.proxy_token,
        curl: data.curl,
        domain_name: data.domain_name,
        project_name: data.project_name,
      };
      let res: any;

      if (mode === "add") {
        res = await apiClient.post("/api/proxy", send_data);
      } else {
        res = await apiClient.put(BACKEND_URL + "/api/proxy/" + id, send_data);
      }
      toast.success(res.data.message);
      navigate("/proxy");
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
  const creditValue = watch("credit");

  return (
    <div className="py-4">
      <div>
        {/* Card */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-2xl ">
          {/* Header */}
          <div className="px-2 py-3 border border-gray-200 bg-gray-50 sm:px-8 ">
            <div className="flex items-center gap-3 ">
              <div className="flex items-center justify-center w-10 h-10 ">
                <FaExchangeAlt className="w-5 h-5" />
              </div>
              <div>
                <h2
                  ref={topRef}
                  className="text-xl font-semibold tracking-tight text-gray-800 sm:text-2xl"
                >
                  {mode === "add" ? "Add Proxy" : "Edit Proxy"}
                </h2>
                <p className="mt-1 text-base">
                  {mode === "add"
                    ? "Add a new proxy to your collection"
                    : "Update proxy information"}
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
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Proxy Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    disabled={mode === "edit"}
                    type="text"
                    placeholder="e.g., BrightData US Proxy"
                    {...register("proxy_name")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.proxy_name
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Proxy Token <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    disabled={mode === "edit"}
                    type="text"
                    placeholder="Enter API token or authentication key"
                    {...register("proxy_token")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.proxy_token
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Curl <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    disabled={mode === "edit"}
                    type="text"
                    placeholder="Paste full curl command (e.g., curl https://api.example.com ...)"
                    {...register("curl")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.curl
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              {/* Domain Field */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Domain Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    type="text"
                    placeholder="e.g., example.com or api.example.com"
                    {...register("domain_name")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.domain_name
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Project Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    type="text"
                    placeholder="e.g., Ecommerce Scraper / Lead Generation"
                    {...register("project_name")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.project_name
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>
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
                  onClick={() => navigate("/proxy")}
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

export default ProxyAdd;
