import { use, useState } from 'react';
import {DataBaseUser} from '../MockData.js';
import BaseLayout from '../layouts/BaseLayout.jsx';

function RegisterPage({onPageChange}) {

    const [email, setEmail] = useState(null);
    const [confEmail, setConfEmail] = useState(null);
    const [password, setPassword] = useState(null);

    const handleRegister = () => {
        onPageChange(0);
    }

    const goToLogin = () => {
        onPageChange(0);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Register</h2>
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
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">
                        Confirm Email
                    </label>
                    <input
                        type="email"
                        id="confirm email"
                        placeholder="Confirm your email"
                        className="w-full px-4 py-2 mb-4 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setConfEmail(e.target.value)}
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
                    />
                </div>
                <button
                    onClick={handleRegister}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                    Register
                </button>
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
            </div>
        </div>
    );
}

export default RegisterPage;