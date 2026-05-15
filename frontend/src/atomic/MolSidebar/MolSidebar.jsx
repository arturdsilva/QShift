import { X, LogOut, CalendarRange, BarChart3, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, SelectableButton } from '../AtmButton/index.js';
import { AtmText } from '../AtmText/index.js';
import './MolSidebar.css';

const navItems = [
  { icon: CalendarRange, label: 'Create Schedule', path: '/staff', indexPage: 1 },
  { icon: LayoutTemplate, label: 'Templates', path: '/templates', indexPage: 2 },
  { icon: BarChart3, label: 'Reports', path: '/reports', indexPage: 3 },
];

/**
 * MolSidebar – sidebar navigation + logout button
 */
export function MolSidebar({ currentPage, onClose }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <div className="mol-sidebar">
      <div className="mol-sidebar__header lg:hidden">
        <AtmText as="h2" size="xl" weight="bold">Menu</AtmText>
        <Button onClick={onClose} variant='ghost'>
          <X size={24} />
        </Button>
      </div>
      <div className="mol-sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.indexPage;
          return (
            <SelectableButton
              key={item.path}
              variant="default"
              selected={isActive}
              onClick={() => {
                navigate(item.path);
                onClose && onClose();
              }}
              className='mol-sidebar__nav-item'
              fullWidth={true}
            >
              <Icon size={20} />
              <AtmText size="sm" weight="medium">{item.label}</AtmText>
            </SelectableButton>
          );
        })}
      </div>
      <Button onClick={logout} variant='logout' fullWidth={true} size='md'>
        <LogOut size={20} />
        <AtmText size="sm" weight="medium">Logout</AtmText>
      </Button>
    </div>
  );
}
