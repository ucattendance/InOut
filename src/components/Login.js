import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

// import jobzenterLogo from '../assets/jzlogo.png';
// import urbancodeLogo from '../assets/uclogo.png';
import { API_ENDPOINTS } from '../utils/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem('token');
        } else {
          if (decoded.role === 'admin') navigate('/dashboard');
          else if (decoded.role === 'employee') navigate('/attendance');
        }
      } catch (err) {
        console.error('Error decoding token:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.login, { email, password }, { validateStatus: s => s < 500 });

      if (response.status !== 200) throw new Error(response.data?.error || 'Login failed');

      const token = response.data.token;
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);

      Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: 'Login successful. Redirecting...',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      setTimeout(() => {
        if (decoded.role === 'admin') navigate('/dashboard');
        else if (decoded.role === 'employee') navigate('/attendance');
        else navigate('/');
      }, 2000);

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err?.message || 'Something went wrong.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg border border-[#e0ecff] rounded-3xl shadow-xl px-8 py-10">
        <div className="flex justify-center items-center gap-4 mb-6">
          <img src="/inout-logo.png" alt="InOut" className="h-20" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#2c2e3e] mb-2">Sign In</h2>
          <p className="text-[#6e7b8b] text-sm">Enter your credentials below</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#2c2e3e] mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/60 placeholder-gray-400 text-gray-800 focus:ring-2 focus:ring-[#6ca8a4] focus:outline-none"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#2c2e3e] mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/60 placeholder-gray-400 text-gray-800 focus:ring-2 focus:ring-[#6ca8a4] focus:outline-none"
              placeholder="••••••••"
            />
            <button
  type="button"
  onClick={() => setShowPassword((prev) => !prev)}
  className="text-sm text-[#6ca8a4] hover:underline mt-1"
>
  {showPassword ? "Hide Password" : "Show Password"}
</button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-[#2c2e3e]">
              <input type="checkbox" className="accent-[#6ca8a4]" />
              Remember me
            </label>
            <button
              type="button"
              onClick={() =>
                Swal.fire({
                  icon: 'info',
                  title: 'Forgot Password?',
                  text: 'Contact admin for password reset.',
                })
              }
              className="text-[#6ca8a4] hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6ca8a4] hover:bg-[#5a9792] text-white font-semibold py-3 rounded-lg transition duration-150 shadow-md"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm mt-6 text-[#6e7b8b]">
          Don’t have an account?{' '}
          <a href="/register" className="text-[#5a9792] font-semibold hover:underline">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
