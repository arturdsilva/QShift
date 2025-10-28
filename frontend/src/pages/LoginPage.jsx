import { useState } from 'react';

function LoginPage({
    onPageChange
}) {
    // evento que o usário preenche com username e senha
    const [user, setUserState] = useState(null);
    const DataBaseUser = {
        user_id: 1,
        name: 'Demo User',
        password: '123'
    };

    const handleLogin = () => {
        // Simulate login

        // localStorage.setItem("user_id", response.data.user_id) quando fizer a requisição real
        localStorage.setItem("user_id", DataBaseUser.user_id);
        onPageChange(1);
        console.log('User logged in:', DataBaseUser);
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