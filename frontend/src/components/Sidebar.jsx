import { CalendarRange, BarChart3, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Sidebar({currentPage}){
  const navigate = useNavigate();
  const navItems = [
        {icon: CalendarRange, label: "Create Schedule", path:"/staff"},
        {icon: BarChart3, label: "Reports", path:"/reports"}
  ];
  const logout = () => {
    localStorage.removeItem("access_token");
    navigate('/login');
  };

  return (
      <div className="w-48 bg-slate-800 border-r border-slate-700 flex flex-col p-4">
        <div className='flex-1'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.index;
            return (
              <button
                key={item.index}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors w-full mb-2 ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700'
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