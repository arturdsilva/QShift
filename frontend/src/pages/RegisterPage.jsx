import { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout.jsx';
import {RegisterApi} from '../services/api.js'

function RegisterPage({onPageChange}) {

    const [email, setEmail] = useState('');
    const [confEmail, setConfEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password || !confEmail) {
            setError('Fill in all fields');
            return;
        } else if (email !== confEmail) {
            setError('The emails are not the same');
            return;
        }

        try {
            const responseRegister = await RegisterApi.registerUser(email, password);
            if (responseRegister.data) {
                alert('User registered successfully');
                onPageChange(0);
            }
        } catch (error) {
            if (error.response?.data?.detail === "Email already registered") {
                setError("Email already registered");
            } else {
                setError("Error registering user. Please try again.");
            }
            console.error('Registration error:', error.response?.data);
        }
    }

    const goToLogin = () => {
        onPageChange(0);
    }

    return (
        <AuthLayout title="Register">
            <form onSubmit={handleRegister}>
                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                        {error}
                    </div>
                )}
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
                    <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="confirm-email">
                        Confirm Email
                    </label>
                    <input
                        type="email"
                        id="confirm-email"
                        placeholder="Confirm your email"
                        className="w-full px-4 py-2 mb-4 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setConfEmail(e.target.value)}
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
                    Register
                </button>
            </form>
            <div className="mt-4 text-center">
                <p className="text-slate-400 text-sm">
                    Already have an account?{' '}
                    <button
                        onClick={goToLogin}
                        className="text-blue-500 hover:text-blue-400 font-medium hover:underline transition-colors cursor-pointer"
                    >
                        Login
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}

export default RegisterPage;