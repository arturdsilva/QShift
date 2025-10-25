import { useState } from 'react';
import { Calendar, Save, X } from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout.jsx';
import Header from '../components/Header.jsx';
import {AvailabilityApi} from '../services/api.js';

// Dados para teste. TODO: Retirar quando conseguir dados pelo backend
const employeesData = {
  1: {
    id: 1,
    name: 'Guilherme Moriya',
    active: true,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  2: {
    id: 2,
    name: 'Artur Dantas',
    active: true,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': false, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': true
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  3: {
    id: 3,
    name: 'Gabriel Padilha',
    active: false,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  4: {
    id: 4,
    name: 'Arthur Rocha',
    active: false,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': true
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  5: {
    id: 5,
    name: 'Ângelo de Carvalho',
    active: true,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  }
};

function AvailabilityPage({
    onPageChange,
    selectEditEmployee,
    setSelectEditEmployee
}) {
    // const employeeData = selectEditEmployee ? AvailabilityApi.getEmployee(selectEditEmployee) : null;
    const employeeData = selectEditEmployee ? employeesData[selectEditEmployee] : null;
    const [name, setName] = useState(employeeData?.name || '');
    const [isActive, setIsActive] = useState(employeeData?.active ?? true);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    const initializeAvailability = () => {
      const initial = {};
      days.forEach(day => {
        initial[day] = {};
        hours.forEach(hour => {
          initial[day][hour] = false;          
        });
      });
      return initial;
    }

    //matriz(7x24) de disponibilidade false = indisponível, true = disponível. Se for para editar é necessário receber essa matriz de disponibilidade do backend
    const [availability, setAvailability] = useState(() =>  employeeData ? employeeData.availability : initializeAvailability())

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [paintMode, setPaintMode] = useState(true); // true = pintar verde, false = pintar vermelho

    const handleMouseDown = (day, hour) => {
        setIsMouseDown(true);
        const newValue = !availability[day][hour];
        setPaintMode(newValue);
        toggleCell(day, hour, newValue);
    };
    
    const handleMouseEnter = (day, hour) => {
        if (isMouseDown) {
        toggleCell(day, hour, paintMode);
        }
    };
    
    const handleMouseUp = () => {
        setIsMouseDown(false);
    };
    
    const toggleCell = (day, hour, value) => {
        setAvailability(prev => ({
        ...prev,
        [day]: {
            ...prev[day],
            [hour]: value
        }
        }));
    };
    
    const handleSave = () => {
        if (selectEditEmployee) {
          AvailabilityApi.updateEmployee(selectEditEmployee, availability );
          console.log('Funcionário atualizado:', {id: selectEditEmployee, name, active: isActive, availability});
        } else {
          // criar um newEmployeeId
          const newEmployeeId = Date.now();
          const Data = {
            id: newEmployeeId,
            name,
            active: isActive,
            availability
          };
          AvailabilityApi.addNewEmployee(Data);
          console.log('Novo funcionário adicionado:', Data);
        }
        onPageChange(1); // Volta para a página de Staff
    };
    
    const handleCancel = () => {
        onPageChange(1); // Volta para a página de Staff
    };

  return (
    <BaseLayout 
        showSidebar={false}
        currentPage={4} 
        onPageChange={onPageChange}>
      <Header title="Employee availability" icon={Calendar} />
      
      <div className="space-y-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* Seção de informações do funcionário */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-2xl text-slate-300">👤</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Employee name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter the name..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                  className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-900 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer transition-colors"
                />
                {isActive && (
                  <svg
                    className="absolute top-0.5 left-0.5 w-4 h-4 text-white pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-slate-500'}`}>
                {isActive ? 'Active Employee' : 'Inactive Employee'}
              </span>
            </label>
          </div>
        </div>
        
        {/* Grade de disponibilidade */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">Select Availability</h3>
            <p className="text-sm text-slate-400">
              Click and drag to mark available (green) or unavailable (red) times
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid" style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}>
                {/* Cabeçalho com dias da semana */}
                <div className="sticky left-0 bg-slate-800 z-10"></div>
                {days.map(day => (
                  <div key={day} className="text-center py-3 px-2 font-semibold text-white border-b border-slate-700">
                    {day}
                  </div>
                ))}
                
                {/* Grade de horários */}
                {hours.map(hour => (
                  <>
                    <div key={`label-${hour}`} className="sticky left-0 bg-slate-800 z-10 py-2 px-3 text-sm text-slate-300 font-medium border-r border-slate-700 flex items-center">
                      {hour}
                    </div>
                    {days.map(day => (
                      <div
                        key={`${day}-${hour}`}
                        onMouseDown={() => handleMouseDown(day, hour)}
                        onMouseEnter={() => handleMouseEnter(day, hour)}
                        className={`
                          h-10 border border-slate-700 cursor-pointer transition-colors select-none
                          ${availability[day][hour] ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                        `}
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </BaseLayout>
  );
}

export default AvailabilityPage;