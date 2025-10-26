import { CalendarRange, Users, BarChart3, Settings } from 'lucide-react';

function Sidebar({currentPage, onPageChange}){
    const navItems = [
        {icon: CalendarRange, label: "Create Schedule", index:0},
        {icon: BarChart3, label: "Reports", index:2},
        {icon: Settings, label: "Settings", index:3}
    ]

  return (
    <div className="w-48 bg-slate-800 border-r border-slate-700 flex flex-col p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.index;
        return (
          <button
            key={item.index}
            onClick={() => onPageChange(item.index)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
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
  );
}

export default Sidebar;