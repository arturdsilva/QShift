import { useState } from 'react';
import {DataBaseUser} from '../MockData.js';
import BaseLayout from '../layouts/BaseLayout.jsx';
import {LoginApi} from '../services/api.js';

function LoginPage({
    onPageChange,
    onLoginSucess,
    isLoading,
    setIsLoading
}) {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const response = await LoginApi.authenticateUser(username, password);
            localStorage.setItem("user_id", response.data.user_id);
        } catch (err) {
            console.error(err);
            if (username === DataBaseUser.username && password === DataBaseUser.password) {
                localStorage.setItem("user_id", DataBaseUser.user_id);
                onLoginSucess();
                console.log('User logged in:', DataBaseUser.username);
            }
            else {
                alert('Invalid username or password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <BaseLayout showSidebar={false} currentPage={0} onPageChange={onPageChange}>
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
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Enter your username"
                        className="w-full px-4 py-2 mb-4 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setUsername(e.target.value)}
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
                    onClick={handleLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                    Enter
                </button>
            </div>
        </div>
    );
}

export default LoginPage;