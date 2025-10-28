import { useState } from 'react';

function LoginPage({
    onPageChange,
    user,
    setUser
}) {
    const handleLogin = () => {
        // Simulate login
        setUser({ name: 'Demo User' });
        onPageChange(1);
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                    Login as Demo User
                </button>
            </div>
        </div>
    );
}

export default LoginPage;