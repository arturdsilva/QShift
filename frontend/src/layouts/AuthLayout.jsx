function AuthLayout({ children, title }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
}

export default AuthLayout;