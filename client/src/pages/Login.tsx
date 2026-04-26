import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import type { loginInterface } from "../interface/login.interface";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import apiClient from "../services/apiClient";
interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup
    .string()
    .email("Invalid email address") // replaces your regex
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});
const Login = () => {
  const { setUserData } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: loginInterface) => {
    try {
      const userData = {
        email: data.email,
        password: data.password,
      };

      const result = await apiClient.post("/api/auth/login", userData);
      const apiUser = result.data.data.user;
      setUserData(apiUser);
      toast.success("Login successfully!"); // ✅ success toast

      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed"); // ✅ error toast
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
  const label_style = "block text-sm font-medium text-gray-700 mb-1.5";
  const textbox_style =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200";
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Card */}
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-xl rounded-2xl">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          {/* Email Field */}
          <div>
            <label htmlFor="email" className={label_style}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
${
  errors.email
    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
}`}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className={label_style}>
                Password
              </label>
            </div>

            <input
              id="password"
              type={showPassword ? "text" : "password"} // 👈 toggle
              placeholder="Enter password"
              autoComplete="current-password"
              className={`w-full px-4 py-3 rounded-xl bg-white border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-panel focus:border-transparent transition text-sm border-slate-300 disabled:bg-gray-100 
disabled:text-gray-400 
disabled:cursor-not-allowed 
disabled:border-gray-200
${
  errors.password
    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
    : "border-gray-300 focus:ring-primary/20 focus:border-primary"
}`}
              {...register("password")}
            />

            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[45px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative w-full py-2.5 px-4 bg-primary hover:bg-primaryHover text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5 animate-spin"
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
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Sign Up Link */}
          {/* <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-medium transition-colors duration-200 text-primary hover:text-primaryHover"
            >
              Create account
            </button>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
