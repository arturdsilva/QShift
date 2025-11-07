import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState } from 'react';
import { Plus, Save, RotateCcw, Calendar, Trash2, ArrowLeft } from 'lucide-react';
import { ShiftConfigApi }   from '../services/api.js';
import { week } from '../MockData.js';

function ShiftConfigPage({onPageChange, selectedDays, startDate}) {

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
                {weekday: 0, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[0]},
                {weekday: 1, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[1]},
                {weekday: 2, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[2]},
                {weekday: 3, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[3]},
                {weekday: 4, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[4]},
                {weekday: 5, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[5]},
                {weekday: 6, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[6]},
            ]
        }
    ]);

    const handleBack = () => {
        console.log("Voltando para página de calendário");
        onPageChange(2);
    };

    const addTurn = () => {
        //TODO: colocar o data em cada turno está relacionado com os dias selecionados
        const newShift = {
            id: Date.now(),
            config: [
                {weekday: 0, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[0]},
                {weekday: 1, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[1]},
                {weekday: 2, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[2]},
                {weekday: 3, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[3]},
                {weekday: 4, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[4]},
                {weekday: 5, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[5]},
                {weekday: 6, startTime: '', endTime: '', employees: '', localDate: selectedDaysMap[6]},
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

    // TODO: Trocar quando for para usar arquivos ao invés de localStorage
    // const fs = require('fs');
    // const path = require('path');

    const saveConfigShift = () => {
        const configToSave = shifts.map(shift => ({
            id: shift.id,
            config: shift.config.map(dayConfig => ({
                weekday: dayConfig.weekday,
                startTime: dayConfig.startTime,
                endTime: dayConfig.endTime,
                employees: dayConfig.employees
            }))
        }));
        // const configPath = path.join(__dirname, 'shiftConfigurations.json');
        // fs.writeFileSync(configPath, JSON.stringify(configToSave, null, 2));
        localStorage.setItem('shiftConfigurations', JSON.stringify(configToSave));
        console.log("Configurações de turno salvas:", configToSave);
    };

    const restoreConfigShift = () => {
        /* const configPath = path.join(__dirname, 'shiftConfigurations.json');
        if (!fs.existsSync(configPath)) {
            console.log("Nenhum arquivo de configuração encontrado.");
            return;
        }
        const savedConfig = fs.readFileSync(configPath); */
        const savedConfig =  localStorage.getItem('shiftConfigurations');
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            const restoredShifts = parsedConfig.map(shift => ({
                ...shift,
                config: shift.config.map((dayConfig, index) => ({
                    ...dayConfig,
                    localDate: selectedDaysMap[index] || null
                }))
            }));
            setShifts(restoredShifts);
            console.log("Configurações de turno restauradas:", restoredShifts);
        } else {
            console.log("Nenhuma configuração salva encontrada.");
        }
    }

    const handleShiftsSchedule = () => {
        let shiftsSchedule = [];
        shifts.forEach(weekShift => {
            weekShift.config.forEach(shift => {
                shiftsSchedule.push(shift);
            })
        })
        return shiftsSchedule;
    }

    const createSchedule = async () => {
        const shiftsSchedule = handleShiftsSchedule();
        console.log('shiftsSchedule', shiftsSchedule);
        const week = {
            start_date: startDate.toISOString().split('T')[0],
            open_days: openDaysMask
        }
        console.log('Semana que vai ser criada', week);
        const responseWeek = await ShiftConfigApi.submitWeekData(week);
        console.log('Semana criada', responseWeek.data);
        ShiftConfigApi.createShcedule(responseWeek.data, shiftsSchedule);
        onPageChange(7);
    }
 
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