import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState } from 'react';
import { Plus, Save, RotateCcw, Calendar, Trash2 } from 'lucide-react';

function ShiftConfigPage({onPageChange, selectedDays}) {

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const selectedDaysMap = {};
    selectedDays.forEach(day => {
        selectedDaysMap[day.getDay()] = day;
    });

    const [shifts, setShifts] = useState([
        {
            id:1,
            config: {
                0: {startTime: '', endTime: '', employees: ''},
                1: {startTime: '', endTime: '', employees: ''},
                2: {startTime: '', endTime: '', employees: ''},
                3: {startTime: '', endTime: '', employees: ''},
                4: {startTime: '', endTime: '', employees: ''},
                5: {startTime: '', endTime: '', employees: ''},
                6: {startTime: '', endTime: '', employees: ''},
            }
        }
    ]);

    const handleCancel = () => {
        console.log("Voltando para página de calendário");
        onPageChange(0);
    };

    const addTurn = () => {
        const newShift = {
            id: Date.now(),
            config: {
                0: {startTime: '', endTime: '', employees: ''},
                1: {startTime: '', endTime: '', employees: ''},
                2: {startTime: '', endTime: '', employees: ''},
                3: {startTime: '', endTime: '', employees: ''},
                4: {startTime: '', endTime: '', employees: ''},
                5: {startTime: '', endTime: '', employees: ''},
                6: {startTime: '', endTime: '', employees: ''},
            }
        }
        setShifts([...shifts, newShift]);
    };

    const removeShift = (shiftId) => {
        if (shifts.length > 1) {
            setShifts(shifts.filter(shift => shift.id !== shiftId));
        }
    };

    const updateShiftConfig = (shiftId, daysOfWeek, field, value) => {
        setShifts(shifts.map(shift => {
            if (shift.id === shiftId) {
                return {
                    ...shift,
                    config: {
                        ...shift.config,
                        [daysOfWeek] : {
                            ...shift.config[daysOfWeek],
                            [field] : value
                        }
                    }
                };
            }

            return shift;
        }));
    };

    const saveConfigShift = async () => {
        // TODO: guardar shifts em alguma estrutura JSON e mandar pro backend
    };

    const restoreConfigShift = async () => {
        // TODO: Receber do backend shifts em uma matriz de dicionários(structs) de células com horários de turnos e funcionários
    }

    const createSchedule = async () => {
        // TODO: guardar shifts em alguma estrutura JSON e mandar pro backend
    }

    

 
    return (
        <BaseLayout
            showSidebar={false}
            currentPage={5}
            showSelectionPanel={true}
            selectionPanelData={{ none: null ,selectedDays }}
            onPageChange={onPageChange}
        >
            <Header title="Configuração de Turnos" />
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
                                                        step="3600"
                                                        value={shift.config[dayIdx].startTime}
                                                        onChange={(e) => {
                                                            const hour = e.target.value.split(':')[0];
                                                            updateShiftConfig(
                                                            shift.id, 
                                                            dayIdx, 
                                                            'startTime', 
                                                            `${hour}:00`
                                                        )}}
                                                        className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                        placeholder="Begin"
                                                    />
                                                    <input
                                                        type="time"
                                                        step="3600"
                                                        value={shift.config[dayIdx].endTime}
                                                        onChange={(e) => {
                                                            const hour = e.target.value.split(':')[0];
                                                            updateShiftConfig(
                                                            shift.id, 
                                                            dayIdx, 
                                                            'endTime', 
                                                            `${hour}:00`
                                                        )}}
                                                        className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                        placeholder="End"
                                                    />
                                                </div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="50"
                                                    value={shift.config[dayIdx].employees}
                                                    onChange={(e) => updateShiftConfig(
                                                        shift.id, 
                                                        dayIdx, 
                                                        'employees', 
                                                        e.target.value
                                                    )}
                                                    className="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                                                    placeholder="Qtd funcionários"
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
                className="w-full mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add shift
            </button>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    Cancel
                </button>
                
                <button
                    onClick={restoreConfigShift}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Restore settings
                </button>
                
                <button
                    onClick={saveConfigShift}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save settings
                </button>
                
                <button
                    onClick={createSchedule}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 ml-auto"
                >
                    <Calendar className="w-4 h-4" />
                    Create Schedule
                </button>
            </div>
        </BaseLayout>
    );
}

export default ShiftConfigPage;