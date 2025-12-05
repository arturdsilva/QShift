import { CalendarRange, BarChart3, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Sidebar({ currentPage, onClose }) {
  const navigate = useNavigate();
  const navItems = [
    { icon: CalendarRange, label: 'Create Schedule', path: '/staff', indexPage: 1 },
    { icon: BarChart3, label: 'Reports', path: '/reports', indexPage: 3 },
  ];
  const logout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="w-48 bg-slate-800 border-r border-slate-700 flex flex-col p-4 h-full">
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <h2 className="text-white font-bold text-xl">Menu</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.indexPage;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose && onClose();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors w-full mb-2 ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => logout()}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-red-600 hover:text-white"
      >
        <LogOut size={20} />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </div>
  );
}

export default Sidebar;
