import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../services/api";
import logo from "../assets/Logo.png";
import { FiUser, FiLock, FiAlertCircle } from "react-icons/fi";

interface LoginForm {
  username: string;
  password: string;
}

const getPersianYear = (): string => {
  const gregorianYear = new Date().getFullYear();
  const persianYear = gregorianYear - 621;
  return persianYear
    .toString()
    .replace(/0/g, "۰")
    .replace(/1/g, "۱")
    .replace(/2/g, "۲")
    .replace(/3/g, "۳")
    .replace(/4/g, "۴")
    .replace(/5/g, "۵")
    .replace(/6/g, "۶")
    .replace(/7/g, "۷")
    .replace(/8/g, "۸")
    .replace(/9/g, "۹");
};

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const persianYear = getPersianYear();

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await login(data.username, data.password);
      navigate("/1");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Aurora background comes from body — this wrapper just centres the card */
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Floating white card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 p-8 sm:p-10 space-y-8">
        {/* Logo + heading */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src={logo} alt="خوبات" className="h-20 drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">خوش اومدی!</h2>
          <p className="text-sm text-gray-400">
            برای استفاده از خوبات، اول باید وارد بشی 😊
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              نام کاربری
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
                <FiUser size={16} />
              </span>
              <input
                {...register("username", { required: "نام کاربری الزامی است" })}
                type="text"
                className={`
                  block w-full rounded-xl border pr-10 pl-3 py-3 text-sm text-gray-900
                  placeholder-gray-300 bg-white
                  focus:outline-none focus:ring-2 transition
                  ${
                    errors.username
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"
                  }
                `}
                placeholder="نام کاربری خود را وارد کنید"
                disabled={isLoading}
                autoComplete="username"
                style={{ backgroundColor: "white" }}
              />
              {errors.username && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-400">
                  <FiAlertCircle size={16} />
                </span>
              )}
            </div>
            <div className="h-4 mt-1">
              {errors.username && (
                <p className="text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رمز عبور
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
                <FiLock size={16} />
              </span>
              <input
                {...register("password", { required: "رمز عبور الزامی است" })}
                type="password"
                className={`
                  block w-full rounded-xl border pr-10 pl-3 py-3 text-sm text-gray-900
                  placeholder-gray-300 bg-white
                  focus:outline-none focus:ring-2 transition
                  ${
                    errors.password
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400"
                  }
                `}
                placeholder="رمز عبور خود را وارد کنید"
                disabled={isLoading}
                autoComplete="current-password"
                style={{ backgroundColor: "white" }}
              />
              {errors.password && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-400">
                  <FiAlertCircle size={16} />
                </span>
              )}
            </div>
            <div className="h-4 mt-1">
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full flex items-center justify-center gap-2
              py-3 px-4 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-l from-indigo-500 to-blue-500
              hover:from-indigo-600 hover:to-blue-600
              shadow-lg shadow-indigo-200
              focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <span>ورود به حساب کاربری</span>
            )}
          </button>
        </form>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-300 font-light">
          © {persianYear} طراحی و توسعه توسط حسام جوادی
        </p>
      </div>
    </div>
  );
};

export default Login;
