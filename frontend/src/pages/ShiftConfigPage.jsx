import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState } from 'react';
import { Plus, Save, RotateCcw, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { ShiftConfigApi }   from '../services/api.js';
import { week } from '../MockData.js';

function ShiftConfigPage({onPageChange, selectedDays, startDate, setWeekId}) {

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const openDaysMask = [];
    const selectedDaysMap = {};
    selectedDays.forEach(day => {
        selectedDaysMap[day.getDay()===0 ? 6 : day.getDay()-1] = day;
        openDaysMask.push(day.getDay() === 0 
        ? 6
        : day.getDay() - 1);
    });
    openDaysMask.sort((a, b) => a - b);

    const [shifts, setShifts] = useState([
        {
            id: 1,
            config: [
                {weekday: 0, start_time: '', end_time: '', min_staff: null},
                {weekday: 1, start_time: '', end_time: '', min_staff: null},
                {weekday: 2, start_time: '', end_time: '', min_staff: null},
                {weekday: 3, start_time: '', end_time: '', min_staff: null},
                {weekday: 4, start_time: '', end_time: '', min_staff: null},
                {weekday: 5, start_time: '', end_time: '', min_staff: null},
                {weekday: 6, start_time: '', end_time: '', min_staff: null},
            ]
        }
    ]);

    const handleBack = () => {
        console.log("Voltando para página de calendário");
        onPageChange(2);
    };

    const addTurn = () => {
        const newShift = {
            id: Date.now(),
            config: [
                {weekday: 0, start_time: '', end_time: '', min_staff: null},
                {weekday: 1, start_time: '', end_time: '', min_staff: null},
                {weekday: 2, start_time: '', end_time: '', min_staff: null},
                {weekday: 3, start_time: '', end_time: '', min_staff: null},
                {weekday: 4, start_time: '', end_time: '', min_staff: null},
                {weekday: 5, start_time: '', end_time: '', min_staff: null},
                {weekday: 6, start_time: '', end_time: '', min_staff: null},
            ]
        }
        setShifts([...shifts, newShift]);
        console.log("Adicionando novo turno:", newShift);
    };

    const removeShift = (shiftId) => {
        if (shifts.length > 1) {
            setShifts(shifts.filter(shift => shift.id !== shiftId));
        }
    };

    const updateShiftConfig = (shiftId, dayOfWeek, field, value) => {
        setShifts(shifts.map(shift => {
            if (shift.id === shiftId) {
                return {
                    ...shift,
                    config: shift.config.map((dayConfig, index) => {
                        if (index === dayOfWeek) {
                            return {
                                ...dayConfig,
                                [field]: value
                            };
                        }
                        return dayConfig;
                    })
                };
            }
            return shift;
        }));
    };

    const saveConfigShift = () => {
        const configToSave = shifts.map(shift => ({
            id: shift.id,
            config: shift.config.map(dayConfig => ({
                weekday: dayConfig.weekday,
                start_time: dayConfig.start_time,
                end_time: dayConfig.end_time,
                min_staff: dayConfig.min_staff ? Number(dayConfig.min_staff) : null
            }))
        }));
        localStorage.setItem('shiftConfigurations', JSON.stringify(configToSave));
        console.log("Configurações de turno salvas:", configToSave);
    };

    const restoreConfigShift = () => {
        const savedConfig =  localStorage.getItem('shiftConfigurations');
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            const restoredShifts = parsedConfig.map(shift => ({
                ...shift,
                config: shift.config.map(dayConfig => ({
                    ...dayConfig,
                    min_staff: dayConfig.min_staff !== null ? Number(dayConfig.min_staff) : null
                }))
            }));
            setShifts(restoredShifts);
            console.log("Configurações de turno restauradas:", restoredShifts);
        } else {
            console.log("Nenhuma configuração salva encontrada.");
        }
    }

    const handleShiftsSchedule = (weekId) => {
        let shiftsSchedule = [];
        shifts.forEach(weekShift => {
            weekShift.config.forEach(shift => {
                const isDaySelected = selectedDaysMap[shift.weekday] !== undefined;
                
                if (isDaySelected && 
                    shift.start_time && 
                    shift.end_time && 
                    shift.min_staff) {
                    shiftsSchedule.push({
                        weekday: shift.weekday,
                        start_time: shift.start_time,
                        end_time: shift.end_time,
                        min_staff: Number(shift.min_staff)
                    });
                }
            });
        });
        
        return shiftsSchedule;
    };

    const createSchedule = async () => {
        try {
            const week = {
                start_date: startDate.toISOString().split('T')[0],
                open_days: openDaysMask
            };
            console.log('Criando semana:', week);
            const responseWeek = await ShiftConfigApi.submitWeekData(week);
            console.log('Semana criada com sucesso:', responseWeek.data);
            const weekId = responseWeek.data.id;
            setWeekId(weekId);

            const shiftsSchedule = handleShiftsSchedule(weekId);
            console.log('Turnos a serem criados:', shiftsSchedule);
            if (shiftsSchedule.length === 0) {
                alert('Nenhum turno válido configurado. Preencha os horários e quantidade de funcionários.');
                return;
            }
            
            for (const shift of shiftsSchedule) {
                try {
                    console.log('Criando turno:', shift);
                    const response = await ShiftConfigApi.createShift(weekId, shift);
                    console.log('Turno criado:', response.data);
                } catch (error) {
                    console.error('Erro ao criar turno específico:', shift, error);
                    throw error;
                }
            }
            console.log('Todos os turnos criados com sucesso!');
            alert('Escala criada com sucesso!');
            onPageChange(7);
            
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
    };
    return (
        <BaseLayout
            showSidebar={false}
            currentPage={6}
            showSelectionPanel={true}
            selectionPanelData={{ startDate, selectedDays }}
            onPageChange={onPageChange}
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
                                        selectedDaysMap[idx] 
                                            ? 'text-slate-200' 
                                            : 'text-slate-500'
                                    }`}
                                >
                                    {day}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-sm font-bold text-slate-200">
                                Delete
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {shifts.map((shift) => (
                            <tr 
                                key={shift.id}
                                className="border-t border-slate-700 hover:bg-slate-750"
                            >
                                {daysOfWeek.map((day, dayIdx) => (
                                    <td 
                                        key={dayIdx}
                                        className={`px-2 py-3 ${
                                            !selectedDaysMap[dayIdx] ? 'bg-slate-900' : ''
                                        }`}
                                    >
                                        {selectedDaysMap[dayIdx] ? (
                                            <div className="flex flex-col gap-2 min-w-[140px]">
                                                <div className="flex gap-1">
                                                    <input
                                                        type="time"
                                                        value={shift.config[dayIdx].start_time}
                                                        onChange={(e) => {
                                                            updateShiftConfig(
                                                                shift.id, 
                                                                dayIdx, 
                                                                'start_time', 
                                                                e.target.value
                                                            )
                                                        }}
                                                        className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                        placeholder="Begin"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={shift.config[dayIdx].end_time}
                                                        onChange={(e) => {
                                                            updateShiftConfig(
                                                                shift.id, 
                                                                dayIdx, 
                                                                'end_time', 
                                                                e.target.value
                                                            )
                                                        }}
                                                        className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                        placeholder="End"
                                                    />
                                                </div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    value={shift.config[dayIdx].min_staff}
                                                    onChange={(e) => updateShiftConfig(
                                                        shift.id, 
                                                        dayIdx, 
                                                        'min_staff', 
                                                        e.target.value
                                                    )}
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
                                        onClick={() => removeShift(shift.id)}
                                        disabled={shifts.length === 1}
                                        className={`p-2 rounded-lg transition-colors ${
                                            shifts.length === 1
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