import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import loadingGif from '../assets/LoadingAnimation.gif';
import logo from '../assets/Logo.png';
import { FiUser, FiLock, FiAlertCircle } from 'react-icons/fi';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      await login(data.username, data.password);
      navigate('/chat');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="خوبات" className="h-20" />
          </div>
          <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-2">خوش اومدی!</h2>
          <p className="text-center text-sm text-gray-500">برای استفاده از خوبات، اول باید وارد بشی 😊</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <FiUser />
                </div>
                <input
                  {...register('username', { required: 'نام کاربری الزامی است' })}
                  type="text"
                  className={`appearance-none rounded-lg block w-full pr-10 px-3 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400 text-gray-900 bg-white !bg-white focus:outline-none focus:ring-2 ${errors.username ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm shadow-sm autofill:bg-white`}
                  placeholder="نام کاربری خود را وارد کنید"
                  disabled={isLoading}
                  style={{ backgroundColor: 'white' }}
                  autoComplete="username"
                />
                {errors.username && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiAlertCircle className="text-red-500" />
                  </div>
                )}
              </div>
              <div className="h-5 mt-1">
                {errors.username && (
                  <p className="text-xs text-red-600 flex items-center">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <FiLock />
                </div>
                <input
                  {...register('password', { required: 'رمز عبور الزامی است' })}
                  type="password"
                  className={`appearance-none rounded-lg block w-full pr-10 px-3 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-400 text-gray-900 bg-white !bg-white focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'} sm:text-sm shadow-sm autofill:bg-white`}
                  placeholder="رمز عبور خود را وارد کنید"
                  disabled={isLoading}
                  style={{ backgroundColor: 'white' }}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiAlertCircle className="text-red-500" />
                  </div>
                )}
              </div>
              <div className="h-5 mt-1">
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
            >
              {isLoading ? (
                <img src={loadingGif} alt="در حال ورود..." className="h-5 w-5" />
              ) : (
                <span className="text-base">ورود به حساب کاربری</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 