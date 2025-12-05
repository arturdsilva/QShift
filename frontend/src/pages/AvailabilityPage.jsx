import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Save, X } from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout.jsx';
import Header from '../components/Header.jsx';
import { AvailabilityApi, StaffApi } from '../services/api.js';
import { daysOfWeek } from '../constants/constantsOfTable.js';

function AvailabilityPage({ selectEditEmployee, setSelectEditEmployee, isLoading, setIsLoading }) {
  const navigate = useNavigate();
  const hours = Array.from(
    {
      length: 24,
    },
    (_, i) => `${i.toString().padStart(2, '0')}:00`,
  );
  const [name, setName] = useState(selectEditEmployee?.name || '');
  const [isActive, setIsActive] = useState(selectEditEmployee?.active ?? true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [paintMode, setPaintMode] = useState(true);
  const [error, setError] = useState(null);

  const initializeAvailability = () => {
    const initial = {};
    daysOfWeek.forEach((day) => {
      initial[day] = {};
      hours.forEach((hour) => {
        initial[day][hour] = false;
      });
    });
    return initial;
  };
  const [availability, setAvailability] = useState(() => initializeAvailability());

  const updateAvaibility = (schemas) => {
    const updateAvailability = initializeAvailability();
    schemas.forEach((schema) => {
      let start_time = parseInt(schema.start_time.split(':')[0]);
      let end_time = schema.end_time;
      if (end_time === '23:59:59') {
        end_time = 24;
      } else {
        end_time = parseInt(schema.end_time.split(':')[0]);
      }
      const weekday = daysOfWeek[schema.weekday];
      Array.from({
        length: end_time - start_time,
      }).forEach(() => {
        const slotsTime = `${start_time.toString().padStart(2, '0')}:00`;
        start_time = start_time + 1;
        updateAvailability[weekday][slotsTime] = true;
      });
    });
    setAvailability(updateAvailability);
  };

  useEffect(() => {
    if (!selectEditEmployee?.id) return;
    async function fetchEmployee() {
      try {
        const ListSchemas = await AvailabilityApi.getAvailabilityEmployee(selectEditEmployee.id);
        updateAvaibility(ListSchemas);
      } catch (err) {
        console.error(err);
        alert('Error loading employee data. Please check the console.');
        navigate('/staff');
      } finally {
        setIsLoading(false);
        console.log('página carregada', isLoading);
      }
    }
    fetchEmployee();
  }, [selectEditEmployee?.id]);

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
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour]: value,
      },
    }));
  };

  const handleCancel = () => {
    setSelectEditEmployee(null);
    navigate('/staff');
  };

  const convertAvailabilityToSchemas = () => {
    const SlotsDay = [];
    daysOfWeek.forEach((day, index) => {
      let slotsActive = [];
      let slotPrevious = false;
      const daySlots = availability[day];
      SlotsDay[index] = [];
      Object.entries(daySlots).forEach(([hourLabel, slot]) => {
        const hour = `${hourLabel}:00`;
        if (slot) {
          slotsActive.push(hour);
        } else if (!slot && slotPrevious) {
          SlotsDay[index].push({
            start_time: slotsActive[0],
            end_time: hour,
          });
          slotsActive = [];
        }
        slotPrevious = slot;
      });
      if (slotPrevious && slotsActive.length > 0) {
        SlotsDay[index].push({
          start_time: slotsActive[0],
          end_time: '23:59:59',
        });
      }
    });
    const availabilitySchemas = [];
    SlotsDay.forEach((schemas, day) => {
      availabilitySchemas[day] = [];
      schemas.forEach((slot, index) => {
        availabilitySchemas[day][index] = {
          weekday: day,
          start_time: slot.start_time,
          end_time: slot.end_time,
        };
      });
    });

    return availabilitySchemas;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nome do funcionário é obrigatório');
      return;
    }
    setError(null);
    try {
      const availabilitySchemas = convertAvailabilityToSchemas();

      let employeeId = selectEditEmployee?.id;
      if (!employeeId) {
        console.log('Criando novo funcionário...');
        const newEmployee = await AvailabilityApi.addNewEmployee({
          name: name,
          active: isActive,
        });
        employeeId = newEmployee.id;
        console.log('Funcionário criado:', newEmployee);
      } else {
        console.log('Atualizando funcionário existente...');
        await StaffApi.updateEmployeeData(employeeId, {
          name,
          active: isActive,
        });
      }
      try {
        console.log('Salvando disponibilidades...');
        await AvailabilityApi.replaceAllAvailabilities(employeeId, availabilitySchemas);
        console.log('Funcionário e disponibilidades salvos com sucesso!');
        setSelectEditEmployee(null);
        navigate('/staff');
      } catch (err) {
        console.error('Erro ao salvar disponibilidades:', err);
        await StaffApi.deleteEmployee(employeeId);
        alert('Erro ao salvar disponibilidades. Tente novamente.');
        return;
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError(err.response?.data?.detail || 'Erro ao salvar funcionário. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={5}>
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
    <BaseLayout showSidebar={false} currentPage={5}>
      <Header title="Employee availability" icon={Calendar} />

      <div className="space-y-6" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-2xl text-slate-300">👤</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Employee name</label>
              <input
                type="text"
                value={name}
                maxLength={120}
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-slate-500'}`}
              >
                {isActive ? 'Active Employee' : 'Inactive Employee'}
              </span>
            </label>
          </div>
        </div>

        {/* TODO: Ajeitar o tamanho da tabela de disponibilidade ou trocar linha pela coluna*/}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Select Availability</h3>
              <p className="text-sm text-slate-400">Click and drag to mark available times.</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-700/50 border border-slate-600 rounded"></div>
                <span className="text-slate-300">Unavailable</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full border border-slate-700 rounded-lg overflow-hidden">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `100px repeat(${hours.length}, minmax(40px, 1fr))`,
                }}
              >
                {/* Header: Hours */}
                <div className="sticky left-0 top-0 bg-slate-800 z-20 border border-slate-700"></div>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={`text-center py-3 text-xs font-medium text-slate-400 border border-slate-700 select-none bg-slate-800`}
                  >
                    {hour.split(':')[0]}h
                  </div>
                ))}

                {/* Rows: Days */}
                {daysOfWeek.map((day) => (
                  <div key={`label-${day}`} className="contents">
                    <div className="sticky left-0 bg-slate-800 z-10 py-2 px-3 text-sm text-slate-300 font-medium flex items-center border border-slate-700/50">
                      {day}
                    </div>
                    {hours.map((hour) => (
                      <div
                        key={`${day}-${hour}`}
                        onMouseDown={() => handleMouseDown(day, hour)}
                        onMouseEnter={() => handleMouseEnter(day, hour)}
                        className={`
                          h-10 border border-slate-700/30 cursor-pointer transition-colors select-none
                          ${availability[day][hour] ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-700/20 hover:bg-slate-700/50'}
                        `}
                      />
                    ))}
                  </div>
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
