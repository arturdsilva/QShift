import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import ScheduleTable from '../components/ScheduleTable';
import { useState, useEffect } from 'react';
import {GeneratedScheduleApi} from '../services/api.js'
import {initialScheduleEmpty} from '../MockData.js';

function GeneratedSchedule({
    onPageChange,
    employees,
    setEmployees,
    isLoading,
    setIsLoading,
    weekData
}) {
    const [scheduleData, setScheduleData] = useState(initialScheduleEmpty);
    const [editMode, setEditMode] = useState(false);
    const [isPossible, setIsPossible] = useState(true);
    const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

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
                const response = await GeneratedScheduleApi.generateSchedulePreview(weekData.id);
                
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
        
        if (weekData.id) {
            generateSchedule();
        }
    }, [weekData.id]);

    const handleCancel = async () => {
        if (weekData) {
            try {
                const response = await GeneratedScheduleApi.deleteSchedule(weekData.id);
                console.log('A escala foi deletada com sucesso');
            } catch (error) {
                console.error('Erro ao deletar escala:', error);
            }
        }
        onPageChange(1);
    };

    const handleEdit = () => {
        setEditMode(!editMode);
        onPageChange(7);
    };

    const handleShiftsSchedule = () => {
        const shiftsSchedule = {shifts:[]};
        days_of_week.forEach(day => {
            if (scheduleData[day]) {
                scheduleData[day].forEach(shift => {
                    shiftsSchedule.shifts.push({
                        shift_id: shift.id,
                        employee_ids: shift.employees.map(employee => employee.id)
                    });
                });
            }
        })
        console.log('shiftsSchedule', shiftsSchedule);
        return shiftsSchedule;
    }


    async function handleApproved() {
        const shiftsSchedule = handleShiftsSchedule();
        try {
            const response = await GeneratedScheduleApi.approvedSchedule(weekData.id, shiftsSchedule);
            console.log('Escala criada com sucesso:', response.data);
            onPageChange(1);
        } catch (error) {
            console.error('Erro ao aprovar a escala:', error);
            onPageChange(1);
        }};

    if (isLoading) {
        return (
            <BaseLayout showSidebar={false} currentPage={7} onPageChange={onPageChange}>
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
            currentPage={7}
        >
            <Header title="Generated Schedule" />
            <div className="p-3">
                <ScheduleTable
                    scheduleData={scheduleData}
                    setScheduleData={setScheduleData}
                    employeeList={employees}
                    week={weekData}
                    editMode={editMode}
                />

                {!editMode ? (
                  <div className="flex mt-4">
                      <div className="flex-1 justify-start flex">
                          <div className='px-2 py-1.5 rounded text-center font-medium'>
                              <button
                                  onClick={handleCancel}
                                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                  Cancel
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
                          <div className='px-2 py-1.5 rounded text-center font-medium'>
                              <button
                                  onClick={handleApproved}
                                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                  Approved
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
    );
}

export default GeneratedSchedule;