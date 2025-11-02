import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import ScheduleTable from '../components/ScheduleTable';
import { useState, useEffect } from 'react';
import {GeneratedScheduleApi} from '../services/api.js'

// DADOS MOCKADOS
const MOCK_EMPLOYEES = [{id: 4, name: 'Arthur'}, {id: 2, name: 'Artur'}, {id: 3, name: 'Gabriel'}, {id: 1, name: 'Guilherme'}, {id: 5, name: 'Ângelo'}, {id: 6, name: 'Mariana'}, {id: 7, name: 'Larissa'}, {id: 8, name: 'Beatriz'}];
const INITIAL_SCHEDULE = {
  // Cada dia tem seus próprios horários
  monday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 3, name: 'Gabriel'}] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{id: 2, name: 'Artur'}, {id: 1, name: 'Guilherme'}] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 4, name: 'Arthur'}]},
  ],
  tuesday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 2, name: 'Artur'}, {id: 3, name: 'Gabriel'}] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [{id: 1, name: 'Guilherme'}] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 4, name: 'Arthur'}, {id: 5, name: 'Ângelo'}] },
  ],
  wednesday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [] },
  ],
  thursday: [
      { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 1, name: 'Guilherme'}, {id: 5, name: 'Ângelo'}]},
      { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
      { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [{id: 3, name: 'Gabriel'}] },
      { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 4, name: 'Arthur'}, {id: 2, name: 'Artur'}] },
  ],
  friday: [
      { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 4, name: 'Arthur'}] },
      { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{id: 1, name: 'Guilherme'}, {id: 3, name: 'Gabriel'}] },
      { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
      { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 2, name: 'Artur'}] },
  ],
  saturday: [
      { id: 101, startTime: '09:00', endTime: '13:00', minEmployees: 3, employees: [{id: 3, name: 'Gabriel'}, {id: 2, name: 'Artur'}, {id: 1, name: 'Guilherme'}] },
      { id: 102, startTime: '09:00', endTime: '15:00', minEmployees: 4, employees: [{id: 4, name: 'Arthur'}, {id: 5, name: 'Ângelo'}] },
      { id: 103, startTime: '13:00', endTime: '18:00', minEmployees: 4, employees: [] },
      { id: 104, startTime: '14:00', endTime: '20:00', minEmployees: 5, employees: [] },
  ],
  sunday: []
};
const INITIAL_SCHEDULE2 = {
  monday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  tuesday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  wednesday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  thursday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  friday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  saturday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  sunday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
};


const week = {
  id: 5,
  startDateWeek: new Date(2025, 9, 27),
  selectedDays: [27, 28, 29, 30, 31, 1],
  approved: false
}

function GeneratedSchedule({onPageChange}) {
    const [scheduleData, setScheduleData] = useState(INITIAL_SCHEDULE2);
    const [employeeList, setEmployeeList] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    async function fetchData() {
        setIsLoading(true); 
        try {
        const [employeesResponse, scheduleResponse] = await Promise.all([
            GeneratedScheduleApi.getEmployees(),
            GeneratedScheduleApi.getGeneratedSchedule(),
        ]);

        setEmployeeList(employeesResponse.data);
        setScheduleData(scheduleResponse.data);

        console.log('Fetched employees:', employeesResponse.data);
        console.log('Fetched schedule:', scheduleResponse.data);
        } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
        setEmployeeList(MOCK_EMPLOYEES);
        setScheduleData(INITIAL_SCHEDULE);
        } finally {
            setIsLoading(false);
        }
    }

    fetchData();
    }, []);

    function handleCancel() {
        onPageChange(1);
    };

    function handleEdit() {
        setEditMode(!editMode);
        onPageChange(7);
    };

    async function handleApproved() {
    try {
        const response = await GeneratedScheduleApi.approvedSchedule(scheduleData);
        console.log('Escala criada com sucesso:', response.data);
        onPageChange(1);
    } catch (error) {
        console.error('Erro ao aprovar a escala:', error);
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
                    employeeList={employeeList}
                    week={week}
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