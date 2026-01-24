import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout.jsx';
import BaseLayout from '../layouts/BaseLayout.jsx';
import { LoginApi } from '../services/api.js';

function LoginPage({ isLoading, setIsLoading }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await LoginApi.authenticateUser(email, password);
      localStorage.setItem('token', response.data.access_token);

      navigate('/staff');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        alert(err.response.data.detail || 'Invalid email or password');
        setIsLoading(false);
      }
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={0}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <AuthLayout title="Login">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 mb-4 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 mb-6 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Enter
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-slate-400 text-sm">
          Don't have an account?{' '}
          <button
            onClick={goToRegister}
            className="text-blue-500 hover:text-blue-400 font-medium hover:underline transition-colors cursor-pointer"
          >
            Register
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
