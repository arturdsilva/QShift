import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, RotateCcw, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { GeneratedScheduleApi } from '../services/api.js';

function ShiftConfigPage({
  selectedDays,
  startDate,
  setWeekData,
  setShiftsData,
  setPreviewSchedule,
}) {
  const navigate = useNavigate();
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const openDaysMask = [];
  const selectedDaysMap = {};
  selectedDays.forEach((day) => {
    selectedDaysMap[day.getDay() === 0 ? 6 : day.getDay() - 1] = day;
    openDaysMask.push(day.getDay() === 0 ? 6 : day.getDay() - 1);
  });
  openDaysMask.sort((a, b) => a - b);

  const [weekShifts, setWeekShifts] = useState([
    {
      id: 1,
      config: [
        { weekday: 0, start_time: '', end_time: '', min_staff: null },
        { weekday: 1, start_time: '', end_time: '', min_staff: null },
        { weekday: 2, start_time: '', end_time: '', min_staff: null },
        { weekday: 3, start_time: '', end_time: '', min_staff: null },
        { weekday: 4, start_time: '', end_time: '', min_staff: null },
        { weekday: 5, start_time: '', end_time: '', min_staff: null },
        { weekday: 6, start_time: '', end_time: '', min_staff: null },
      ],
    },
  ]);

  const handleBack = () => {
    console.log('Voltando para página de calendário');
    navigate('/calendar');
  };

  const addTurn = () => {
    const newWeekShift = {
      id: Date.now(),
      config: [
        { weekday: 0, start_time: '', end_time: '', min_staff: null },
        { weekday: 1, start_time: '', end_time: '', min_staff: null },
        { weekday: 2, start_time: '', end_time: '', min_staff: null },
        { weekday: 3, start_time: '', end_time: '', min_staff: null },
        { weekday: 4, start_time: '', end_time: '', min_staff: null },
        { weekday: 5, start_time: '', end_time: '', min_staff: null },
        { weekday: 6, start_time: '', end_time: '', min_staff: null },
      ],
    };
    setWeekShifts([...weekShifts, newWeekShift]);
    console.log('Adicionando novo turno:', newWeekShift);
  };

  const removeShift = (weekShiftId) => {
    if (weekShifts.length > 1) {
      setWeekShifts(weekShifts.filter((weekShift) => weekShift.id !== weekShiftId));
    }
  };

  const updateShiftConfig = (weekShiftId, dayOfWeek, field, value) => {
    setWeekShifts(
      weekShifts.map((weekShift) => {
        if (weekShift.id === weekShiftId) {
          return {
            ...weekShift,
            config: weekShift.config.map((dayConfig, index) => {
              if (index === dayOfWeek) {
                return {
                  ...dayConfig,
                  [field]: value,
                };
              }
              return dayConfig;
            }),
          };
        }
        return weekShift;
      }),
    );
  };

  const saveConfigShift = () => {
    const configToSave = weekShifts.map((weekShift) => ({
      id: weekShift.id,
      config: weekShift.config.map((dayConfig) => ({
        weekday: dayConfig.weekday,
        start_time: dayConfig.start_time,
        end_time: dayConfig.end_time,
        min_staff: dayConfig.min_staff ? Number(dayConfig.min_staff) : null,
      })),
    }));
    localStorage.setItem('shiftConfigurations', JSON.stringify(configToSave));
    console.log('Configurações de turno salvas:', configToSave);
  };

  const restoreConfigShift = () => {
    const savedConfig = localStorage.getItem('shiftConfigurations');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      const restoredShifts = parsedConfig.map((weekShift) => ({
        ...weekShift,
        config: weekShift.config.map((dayConfig) => ({
          ...dayConfig,
          min_staff: dayConfig.min_staff !== null ? Number(dayConfig.min_staff) : null,
        })),
      }));
      setWeekShifts(restoredShifts);
      console.log('Configurações de turno restauradas:', restoredShifts);
    } else {
      console.log('Nenhuma configuração salva encontrada.');
    }
  };

  const handleShiftsSchedule = () => {
    let shiftsSchedule = [];
    const errors = [];
    weekShifts.forEach((weekShift, weekShiftIndex) => {
      weekShift.config.forEach((shift) => {
        const labelShift = `${daysOfWeek[shift.weekday]} - Shift ${weekShiftIndex + 1}`;
        const isDaySelected = selectedDaysMap[shift.weekday] !== undefined;
        if (isDaySelected && (shift.start_time || shift.end_time || shift.min_staff)) {
          const hasAnyField = shift.start_time || shift.end_time || shift.min_staff;
          const hasAllFields = shift.start_time && shift.end_time && shift.min_staff;
          if (hasAnyField && !hasAllFields) {
            let missingFields = [];
            if (!shift.start_time) missingFields.push('hora de início');
            if (!shift.end_time) missingFields.push('hora final');
            if (!shift.min_staff) missingFields.push('número de funcionários');
            errors.push(`${labelShift}: Falta ${missingFields.join(', ')}`);
            return;
          }

          if (shift.start_time && shift.end_time && shift.start_time >= shift.end_time) {
            errors.push(
              `${labelShift}: O horário de término deve ser posterior ao horário de início.`,
            );
            return;
          }
          if (shift.min_staff && Number(shift.min_staff) < 0) {
            errors.push(`${labelShift}: O número mínimo de funcionários deve ser superior a 0.`);
            return;
          }

          if (hasAllFields) {
            shiftsSchedule.push({
              weekday: shift.weekday,
              start_time: shift.start_time,
              end_time: shift.end_time,
              min_staff: Number(shift.min_staff),
            });
          }
        }
      });
    });
    if (errors.length > 0) {
      return { success: false, errors };
    }

    if (shiftsSchedule.length === 0) {
      return {
        sucess: false,
        errors: [
          'Por favor, configure pelo menos um turno completo (com horário de início, horário de término e número de funcionários).',
        ],
      };
    }
    setShiftsData(shiftsSchedule);
    return { sucess: true, data: shiftsSchedule };
  };

  const createSchedule = async () => {
    const result = handleShiftsSchedule();
    if (!result.sucess) {
      const errorMessage = result.errors.join('\n\n');
      alert(`Por favor, corrija os seguintes problemas:\n\n${errorMessage}`);
      return;
    }

    const shiftsSchedule = result.data;
    if (shiftsSchedule) {
      try {
        const week = {
          start_date: startDate.toISOString().split('T')[0],
          open_days: openDaysMask,
        };
        setWeekData(week);
        console.log('Criando escala prévia:', week, shiftsSchedule);
        const responsePreviewSchedule =
          await GeneratedScheduleApi.generateSchedulePreview(shiftsSchedule);
        console.log('Escala prévia criada com sucesso:', responsePreviewSchedule.data);
        const preciewScheduleData = responsePreviewSchedule.data;
        setPreviewSchedule(preciewScheduleData);

        navigate('/schedule');
      } catch (error) {
        console.error('Erro ao criar escala:', error);

        if (error.response) {
          console.error('Resposta do servidor:', error.response.data);
          alert(`Erro: ${error.response.data.detail || 'Erro ao criar escala'}`);
        } else if (error.request) {
          console.error('Sem resposta do servidor:', error.request);
          alert('Erro: Servidor não respondeu. Verifique se o backend está rodando.');
        } else {
          console.error('Erro na configuração:', error.message);
          alert(`Erro: ${error.message}`);
        }
      }
    }
  };
  return (
    <BaseLayout
      showSidebar={false}
      currentPage={6}
      showSelectionPanel={true}
      selectionPanelData={{ startDate, selectedDays }}
    >
      <Header title="Shift Configuration" />
      <div className="bg-slate-800 rounded-lg overflow-x-auto border border-slate-700 mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700">
              {daysOfWeek.map((day, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-center text-sm font-bold ${
                    selectedDaysMap[idx] ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {day}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-bold text-slate-200">Delete</th>
            </tr>
          </thead>
          <tbody>
            {weekShifts.map((weekShift) => (
              <tr key={weekShift.id} className="border-t border-slate-700 hover:bg-slate-750">
                {daysOfWeek.map((day, dayIdx) => (
                  <td
                    key={dayIdx}
                    className={`px-2 py-3 ${!selectedDaysMap[dayIdx] ? 'bg-slate-900' : ''}`}
                  >
                    {selectedDaysMap[dayIdx] ? (
                      <div className="flex flex-col gap-2 min-w-[140px]">
                        <div className="flex gap-1">
                          <input
                            type="time"
                            value={weekShift.config[dayIdx].start_time}
                            onChange={(e) => {
                              updateShiftConfig(weekShift.id, dayIdx, 'start_time', e.target.value);
                            }}
                            className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Begin"
                          />
                          <input
                            type="time"
                            value={weekShift.config[dayIdx].end_time}
                            onChange={(e) => {
                              updateShiftConfig(weekShift.id, dayIdx, 'end_time', e.target.value);
                            }}
                            className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                            placeholder="End"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={weekShift.config[dayIdx].min_staff}
                          onChange={(e) =>
                            updateShiftConfig(weekShift.id, dayIdx, 'min_staff', e.target.value)
                          }
                          className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                          placeholder="Number of employees"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-slate-600 text-sm">-</div>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => removeShift(weekShift.id)}
                    disabled={weekShifts.length === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      weekShifts.length === 1
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title="Delete shift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={addTurn}
        className="w-full mb-6 px-6 py-3 bg-slate-700 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add shift
      </button>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 justify-start flex">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back
            <ArrowLeft size={20} />
          </button>
        </div>

        <button
          onClick={restoreConfigShift}
          className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Restore settings
        </button>

        <button
          onClick={saveConfigShift}
          className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save settings
        </button>

        <button
          onClick={createSchedule}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 ml-auto"
        >
          <Calendar className="w-4 h-4" />
          Create Schedule
        </button>
      </div>
    </BaseLayout>
  );
}

export default ShiftConfigPage;
