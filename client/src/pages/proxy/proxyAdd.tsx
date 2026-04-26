import { useEffect, useState, useRef } from "react";
import { showToast } from "../../utils/CustomToast";

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
  proxy_name: yup.string().trim().required("Proxy Name is required"),

  proxy_token: yup.string().trim().required("Proxy Token is required"),

  curl: yup
    .string()
    .trim()
    .required("Curl is required") // ✅ 1) not null
    .test("valid-curl", function (value) {
      if (!value) return false;

      const result = parseCurlParams(value);

      // ✅ 2) invalid curl
      if (result.error) {
        return this.createError({ message: result.error });
      }

      // ✅ 3) at least 1 param (token candidate)
      if (!result.params || result.params.length === 0) {
        return this.createError({
          message: "No parameters found in curl URL",
        });
      }

      return true;
    }),

  curl_token: yup.string().test("token-required", function (value) {
    const { curl } = this.parent;

    if (!curl) return true; // handled by curl validation

    const result = parseCurlParams(curl);

    // if curl invalid → skip (handled above)
    if (result.error || result.params.length === 0) return true;

    // ✅ 4) token must be selected
    // if (!value) {
    //   return this.createError({
    //     message: "Please select token parameter from curl",
    //     path: "curl", // 🔥 IMPORTANT: show error under CURL field
    //   });
    // }

    return true;
  }),

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
    return { params: [] as string[], error: "Invalid curl" };
  }

  const urlString = urlMatch[0];
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { params: [] as string[], error: "Invalid curl" };
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
    mode: "onChange",
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

  // const handleCurlBlur = () => {
  //   const trimmed = curlValue?.trim();
  //   if (!trimmed) return;

  //   const result = parseCurlParams(trimmed);
  //   if (result.error) {
  //     toast.error(result.error);
  //     return;
  //   }

  //   if (result.params.length === 0) {
  //     toast.error("No parameters found in curl URL");
  //   }
  // };

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
      toast.error("Select the token parameter from the curl");
      return;
    }

    if (mode === "edit" && !isDirty) {
      showToast("No changes detected to update.", "info");
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

      showToast(
        err?.response?.data?.message || err?.message || "Something went wrong",
        "error",
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm">
                Project Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Enter Proxy Name"
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
              <label className="block mb-2 text-sm">
                Domain Name (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Enter Domain Name"
                  {...register("domain_name")}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 ${
                    errors.domain_name
                      ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                      : "border-gray-300 focus:ring-primary/20 focus:border-primary"
                  }`}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm">
                Proxy Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
                <input
                  maxLength={200}
                  disabled={mode === "edit"}
                  type="text"
                  placeholder="Enter Proxy Name"
                  {...register("proxy_name")}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
 ${
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
                  maxLength={200}
                  type="text"
                  placeholder="Enter Proxy Token"
                  {...register("proxy_token")}
                  className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
 ${
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
                className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
${
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
                  <div className="p-4 mt-4 space-y-3 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">
                      Select the token parameter from the curl command
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {curlParams.map((param) => (
                        <label
                          key={param}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="curl_token"
                            value={param}
                            checked={selectedCurlToken === param}
                            onChange={() => {
                              setSelectedCurlToken(param);
                              setValue("curl_token", param);
                            }}
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span>{param}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 space-y-3 rounded-lg ">
                <label className="block mb-2 text-sm">
                  Curl URL Token Key{" "}
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

export default ProxyAdd;
