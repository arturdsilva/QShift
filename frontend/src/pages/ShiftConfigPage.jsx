import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, RotateCcw, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { GeneratedScheduleApi } from '../services/api.js';
import { daysOfWeek } from '../constants/constantsOfTable.js';

function ShiftConfigPage({
  selectedDays,
  startDate,
  setWeekData,
  setShiftsData,
  setPreviewSchedule,
  isLoading,
  setIsLoading,
}) {
  const navigate = useNavigate();
  const openDaysMask = [];
  const selectedDaysMap = {};

  useEffect(() => {
    if (!startDate || !selectedDays || selectedDays.length === 0) {
      navigate('/staff');
    }
  }, [startDate, selectedDays, navigate]);

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
    } else {
      console.log('No saved configuration found.');
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
            if (!shift.start_time) missingFields.push('start time');
            if (!shift.end_time) missingFields.push('end time');
            if (!shift.min_staff) missingFields.push('number of employees');
            errors.push(`${labelShift}: Missing ${missingFields.join(', ')}`);
            return;
          }

          if (shift.start_time && shift.end_time && shift.start_time >= shift.end_time) {
            errors.push(`${labelShift}: End time must be after start time.`);
            return;
          }
          if (shift.min_staff && Number(shift.min_staff) < 0) {
            errors.push(`${labelShift}: Minimum number of employees must be greater than 0.`);
            return;
          }

          if (hasAllFields) {
            shiftsSchedule.push({
              id: crypto.randomUUID(),
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
          'Please configure at least one complete shift (with start time, end time, and number of employees).',
        ],
      };
    }
    setShiftsData(shiftsSchedule);
    return { sucess: true, data: shiftsSchedule };
  };

  const convertScheduleData = (shifts) => {
    let scheduleModified = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    shifts.forEach((shift, index) => {
      const dayName = daysOfWeek[shift.weekday];
      scheduleModified[dayName].push({
        id: `${dayName}-${index}`,
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
        minEmployees: shift.min_staff,
        employees: shift.employees.map((emp) => ({
          id: emp.employee_id,
          name: emp.name,
        })),
      });
    });
    daysOfWeek.forEach((day) => {
      scheduleModified[day].sort((a, b) => {
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        if (a.endTime < b.endTime) return -1;
        if (a.endTime > b.endTime) return 1;

        return 0;
      });
    });
    return scheduleModified;
  };

  const createSchedule = async () => {
    const result = handleShiftsSchedule();
    setIsLoading(true);
    if (!result.sucess) {
      const errorMessage = result.errors.join('\n\n');
      setIsLoading(false);
      alert(`Please fix the following issues:\n\n${errorMessage}`);
      return;
    }

    const shiftsSchedule = result.data;
    if (shiftsSchedule) {
      setIsLoading(true);
      try {
        const week = {
          start_date: startDate.toISOString().split('T')[0],
          open_days: openDaysMask,
        };
        setWeekData(week);
        const responsePreviewSchedule = await GeneratedScheduleApi.generateSchedulePreview({
          shift_vector: shiftsSchedule,
        });
        const preciewScheduleData = responsePreviewSchedule.data;

        if (preciewScheduleData.possible && preciewScheduleData.schedule) {
          const convertedData = convertScheduleData(preciewScheduleData.schedule.shifts);
          setPreviewSchedule(convertedData);
        } else {
          alert(
            'Unable to generate a viable schedule with the current settings. Check shift and employee settings.',
          );
          navigate('/staff');
        }

        navigate('/schedule');
      } catch (error) {
        console.error('Error creating schedule:', error);

        if (error.response) {
          console.error('Server response:', error.response.data);
          alert(`Error: ${error.response.data.detail || 'Error creating schedule'}`);
        } else if (error.request) {
          console.error('No response from server:', error.request);
          alert('Error: Server did not respond. Check if the backend is running.');
        } else {
          console.error('Configuration error:', error.message);
          alert(`Error: ${error.message}`);
        }

        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={6}>
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
                          value={weekShift.config[dayIdx].min_staff ?? ''}
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
