import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import ScheduleTable from '../components/ScheduleTable';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import {GeneratedScheduleApi} from '../services/api.js'
import {initialScheduleEmpty} from '../MockData.js';

function ScheduleRecordsPage({
    onPageChange,
    employees,
    setEmployees,
    isLoading,
    setIsLoading,
    weeksList
}) {
    const [editMode, setEditMode] = useState(false);
    const [scheduleData, setScheduleData] = useState(initialScheduleEmpty);
    const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const [week, setWeek] = useState(weeksList[0] || null);

    const convertScheduleData = (shifts) => {
        const scheduleModified = {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
        };
        shifts.forEach(shift => {
            const dayName = days_of_week[shift.weekday];
            scheduleModified[dayName].push({
                id: shift.shift_id,
                startTime: shift.start_time.slice(0, 5),
                endTime: shift.end_time.slice(0, 5),
                minEmployees: shift.min_staff,
                employees: shift.employees.map(emp => ({
                    id: emp.employee_id,
                    name: emp.name
                }))
            });
        });
        setScheduleData(scheduleModified);
    }

    useEffect(() => {
        async function generateSchedule() {
            setIsLoading(true);
            try {
                const response = await GeneratedScheduleApi.generateSchedulePreview(week.id);
                
                if (response.data.possible && response.data.schedule) {
                    convertScheduleData(response.data.schedule.shifts);
                    setIsPossible(true);
                    console.log('A escala possible:', response.data.possible);
                    console.log('A escala criada:', response.data.schedule);
                    console.log('Turnos:', response.data.schedule.shifts);
                } else {
                    setIsPossible(false);
                    alert('Não foi possível gerar uma escala viável com as configurações atuais.');
                }
            } catch (error) {
                console.error('Erro ao gerar escala:', error);
                alert('Erro ao gerar escala. Verifique as configurações de turnos e funcionários.');
            } finally {
                setIsLoading(false);
            }
        }
        
        if (week.id) {
            generateSchedule();
        }
    }, [week.id]);
    const previousWeek = () => {

    };

    const nextWeek = () => {

    };

    const handleEdit = () => {
        setEditMode(!editMode);
    };

    const handleBack = () => {
        onPageChange(3)
    };

    return (
        <BaseLayout
            showSidebar = {false}
            showSelectionPanel = {true}
            selectionPanelData = {null}
            currentPage = {8}
            onPageChange = {onPageChange}
        >
            <Header title={"Schedule Records"} icon={CalendarRange}>
                <div className="flex items-center gap-4 ml-8">
                    <button
                        onClick={previousWeek}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Previous week"
                    >
                        <ChevronLeft size={24} className="text-slate-300" />
                    </button>
                    <button
                        onClick={nextWeek}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Next month"
                    >
                        <ChevronRight size={24} className="text-slate-300" />
                    </button>
                    <span className="text-xl text-slate-200 font-medium min-w-[200px] text-center">
                        out-nov
                    </span>
                </div>
            </Header>
            <div className="p-3">
                {/*
                    <ScheduleTable
                        scheduleData={scheduleData}
                        setScheduleData={setScheduleData}
                        employeeList={employees}
                        week={week}
                        editMode={editMode}
                    />
                */}
                {!editMode ? (
                    <div className="flex mt-4">
                        <div className="flex-1 justify-start flex">
                            <div className='px-2 py-1.5 rounded text-center font-medium'>
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Back
                                </button>
                            </div>
                        </div>

                        <div className="justify-end flex flex-1">
                            <div className='px-2 py-1.5 rounded text-center font-medium'>
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex mt-4">
                        <div className="flex-1 justify-end flex">
                            <div className='px-40 py-1.5 rounded text-center font-medium'>
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BaseLayout>
    )
}

export default ScheduleRecordsPage;
