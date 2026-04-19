import { useEffect, useState, useRef } from "react";

import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import { useForm, type Resolver, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router";
import { FaExchangeAlt } from "react-icons/fa";

type ProxyFormValues = {
  proxy_name: string;
  proxy_token: string;
  curl: string;
  curl_token: string;
  domain_name: string | null | undefined;
  project_name: string | null | undefined;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const schema = yup.object().shape({
  proxy_name: yup.string().required("Proxy Name is required"),
  proxy_token: yup.string().required("Proxy Token is required"),
  curl: yup.string().required("Curl is required"),
  curl_token: yup
    .string()
    .required(
      "Token variable is required. Please make sure you have entered valid curl URL",
    ),
  domain_name: yup.string().notRequired(),
  project_name: yup.string().notRequired(),
});

const parseCurlParams = (curl: string) => {
  const trimmed = curl.trim();
  if (!trimmed) {
    return { params: [] as string[], error: "Curl cannot be empty" };
  }

  const urlMatch = trimmed.match(/https?:\/\/[^\s'"]+/i);
  if (!urlMatch) {
    return { params: [] as string[], error: "Invalid curl URL" };
  }

  const urlString = urlMatch[0];
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { params: [] as string[], error: "Invalid curl URL" };
  }

  const params = new Set<string>();
  url.searchParams.forEach((_, key) => params.add(key));

  const dataMatch = trimmed.match(
    /(?:--data-raw|--data-binary|--data|-d)\s+(?:'([^']*)'|"([^"]*)"|([^\s]+))/i,
  );
  const rawData = dataMatch
    ? dataMatch[1] || dataMatch[2] || dataMatch[3] || ""
    : "";

  if (rawData) {
    const payload = rawData.trim();
    if (payload.startsWith("{") && payload.endsWith("}")) {
      try {
        const jsonBody = JSON.parse(payload);
        Object.keys(jsonBody).forEach((key) => params.add(key));
      } catch {
        // ignore invalid JSON payload for extraction
      }
    } else {
      try {
        const bodyParams = new URLSearchParams(payload);
        bodyParams.forEach((_, key) => params.add(key));
      } catch {
        // ignore invalid body payload for extraction
      }
    }
  }

  return { params: Array.from(params), error: undefined as string | undefined };
};

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
    setError, // ✅ add this
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<ProxyFormValues>({
    resolver: yupResolver(schema) as unknown as Resolver<ProxyFormValues>,
    defaultValues: {
      proxy_name: "",
      proxy_token: "",
      curl: "",
      curl_token: "",
      domain_name: "",
      project_name: "",
    },
  });

  const [curlParams, setCurlParams] = useState<string[]>([]);
  const [selectedCurlToken, setSelectedCurlToken] = useState<string>("");
  const curlValue = watch("curl");

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
        Object.entries(data.data).forEach(([k, v]) => {
          setValue(
            k as keyof ProxyFormValues,
            v as ProxyFormValues[keyof ProxyFormValues],
          );
        });
        if (data.data?.curl_token) {
          setSelectedCurlToken(data.data.curl_token);
          setValue("curl_token", data.data.curl_token);
        }
      } catch (error: unknown) {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, setValue]);

  useEffect(() => {
    if (id) setMode("edit");
  }, [id]);

  useEffect(() => {
    const trimmed = curlValue?.trim();
    if (!trimmed) {
      setCurlParams([]);
      setSelectedCurlToken("");
      setValue("curl_token", "");
      return;
    }

    const result = parseCurlParams(trimmed);
    if (result.error) {
      setCurlParams([]);
      setSelectedCurlToken("");
      setValue("curl_token", "");
      return;
    }

    setCurlParams(result.params);
    const defaultToken = result.params.includes(selectedCurlToken)
      ? selectedCurlToken
      : result.params[0] || "";
    setSelectedCurlToken(defaultToken);
    setValue("curl_token", defaultToken);
  }, [curlValue, selectedCurlToken, setValue]);

  const handleCurlBlur = () => {
    const trimmed = curlValue?.trim();
    if (!trimmed) return;

    const result = parseCurlParams(trimmed);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.params.length === 0) {
      toast.error("No parameters found in curl URL");
    }
  };

  // useEffect(() => {
  //   if (errors) {
  //     const firstError = Object.values(errors)[0];
  //     if (firstError?.message) {
  //       toast.error(firstError.message as string);
  //     }
  //   }
  // }, [errors]);

  type ApiResponse = {
    data?: {
      message?: string;
    };
  };

  const onSubmit: SubmitHandler<ProxyFormValues> = async (data) => {
    if (!curlParams.length) {
      toast.error("No parameters found in curl URL");
      return;
    }

    if (!selectedCurlToken) {
      toast.error("Select the token parameter from the curl command");
      return;
    }
    alert(mode + "===" + isDirty);
    if (mode === "edit" && !isDirty) {
      toast.info("No changes detected to update.");
      return;
    }
    setLoading(true);
    try {
      const send_data: ProxyFormValues = {
        ...data,
        curl_token: selectedCurlToken,
      };
      let res: ApiResponse | undefined;

      if (mode === "add") {
        res = await apiClient.post("/api/proxy", send_data);
      } else {
        res = await apiClient.put(BACKEND_URL + "/api/proxy/" + id, send_data);
      }
      toast.success(res?.data?.message || "Proxy saved successfully");
      navigate("/proxy");
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong",
      );

      window.scrollTo({ top: 0, behavior: "smooth" });

      requestAnimationFrame(() => {
        topRef.current?.focus();
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-primary">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* Accent line touching left border */}
          <div className="-ml-6 w-1 h-6 rounded-r-full bg-menuActive" />

          {/* Title */}
          <div>
            <h5 className=" sm:text-xl  text-white/60">
              {" "}
              {mode === "add" ? "Add Proxy" : "Edit Proxy"}
            </h5>
          </div>
        </div>
      </div>
      {/* Header */}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit as SubmitHandler<unknown>)}
        className="p-6 sm:px-6 sm:py-8"
      >
        <div
          className={`space-y-6 transition-opacity duration-200 ${
            loading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div>
            <label className="block mb-2 text-sm">
              Project Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
              <input
                type="text"
                placeholder="e.g., Ecommerce Scraper / Lead Generation"
                {...register("project_name")}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                  errors.project_name
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                }`}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm">Domain Name (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
              <input
                type="text"
                placeholder="e.g., example.com or api.example.com"
                {...register("domain_name")}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                  errors.domain_name
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                }`}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm">
              Proxy Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
              <input
                disabled={mode === "edit"}
                type="text"
                placeholder="e.g., BrightData US Proxy"
                {...register("proxy_name")}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                  errors.proxy_name
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                }`}
              />
            </div>
            {errors.proxy_name && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.proxy_name.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm">
              Proxy Token <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
              <input
                disabled={mode === "edit"}
                type="text"
                placeholder="Enter API token or authentication key"
                {...register("proxy_token")}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                  errors.proxy_token
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                }`}
              />
            </div>
            {errors.proxy_token && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.proxy_token.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-2 text-sm">
              Curl <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
              <input
                disabled={mode === "edit"}
                type="text"
                placeholder="Paste full curl command (e.g., curl https://api.example.com ...)"
                {...register("curl")}
                onBlur={handleCurlBlur}
                className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                  errors.curl
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                }`}
              />
              {errors.curl && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.curl.message}
                </p>
              )}
              <input type="hidden" {...register("curl_token")} />
            </div>
            {mode == "add" ? (
              <>
                {curlParams.length > 0 && (
                  <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-700">
                      Select the token parameter from the curl command
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {curlParams.map((param) => (
                        <label key={param} className="block mb-2 text-sm">
                          <input
                            type="radio"
                            name="curl_token"
                            value={param}
                            checked={selectedCurlToken === param}
                            onChange={() => {
                              setSelectedCurlToken(param);
                              setValue("curl_token", param);
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <span>{param}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="block mb-2 text-sm">
                  Token from curl request{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                  {getValues("curl_token")}
                </div>
              </div>
            )}
          </div>
          {/* Domain Field */}

          {/* Action Buttons */}
          <div className="flex flex-col justify-end gap-3 pt-6 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/proxy")}
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
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
    </div>
  );
}

export default ProxyAdd;
