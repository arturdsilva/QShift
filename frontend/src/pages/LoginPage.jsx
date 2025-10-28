import { useState } from 'react';

function LoginPage({
    onPageChange
}) {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const DataBaseUser = {
        user_id: 1,
        username: 'gui',
        password: '123'
    };

    const handleLogin = () => {
        // Simulate login
        // TODO: api.login para autenticar usuário
        // localStorage.setItem("user_id", response.data.user_id) quando fizer a requisição real
        if (username === DataBaseUser.username && password === DataBaseUser.password) {
            localStorage.setItem("user_id", DataBaseUser.user_id);
            onPageChange(1);            
            console.log('User logged in:', DataBaseUser);
        }
        else {
            alert('Invalid username or password');
        }
    };
    
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