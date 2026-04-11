import React, { useEffect, useState, useRef } from "react";
import { Key } from "lucide-react";

import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router";
import type { IAliasKey } from "../../interface/aliasKey.interface";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const schema = yup.object().shape({
  domain: yup.string().required("Domain is required"),
  total_quota: yup.string().required("Total quota is required"),
  description: yup.string().optional(),
});

function AliasKeyAdd() {
  const { id } = useParams();
  const topRef = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState("add");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IAliasKey>({
    resolver: yupResolver(schema),
    defaultValues: {
      domain: "",

      description: "",
    },
  });

  useEffect(() => {
    if (!id) return;
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
        domain: data.domain,
        total_quota: Number(data.total_quota),
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
          <div className="px-2 py-3 border border-gray-200 sm:px-8 ">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 ">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2
                  ref={topRef}
                  className="text-xl font-semibold tracking-tight text-gray-800 sm:text-2xl"
                >
                  {mode === "add" ? "Add Alias Key" : "Edit Alias Key"}
                </h2>
                <p className="mt-1 text-base">
                  {mode === "add"
                    ? "Add a new alias key to your collection"
                    : "Update your alias key information"}
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
              {/* Domain Field */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Domain <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g., example.com"
                    {...register("domain")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.domain
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>

              {/* Total Quota Field */}
              <div>
                <label className="block mb-2 text-base font-semibold text-gray-700">
                  Total Quota <span className="text-red-500">*</span>
                </label>
                <div>
                  {mode == "add" ? (
                    <>
                      <input
                        type="text"
                        placeholder="Enter total quota"
                        {...register("total_quota")}
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
                    </>
                  ) : (
                    <> {totalQuotaValue && `${totalQuotaValue}`}</>
                  )}
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
                    placeholder="Describe the purpose of this alias key..."
                    {...register("description")}
                    className={`w-full pl-4 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-y ${
                      errors.description
                        ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                        : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                    }`}
                  />
                </div>
              </div>

              {/* Info Box for Edit Mode */}
              {mode === "edit" && (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-base font-semibold text-blue-800">
                        Editing Mode
                      </h4>
                      <p className="mt-1 text-xs text-blue-600">
                        You are editing an existing alias key. Note that total
                        quota can not be modified.
                      </p>
                    </div>
                  </div>
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
                    <>{mode === "add" ? "Add Alias Key" : "Update Changes"}</>
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
