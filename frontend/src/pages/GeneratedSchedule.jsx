import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import ScheduleTable from '../components/ScheduleTable';
import { useState, useEffect } from 'react';
import {GeneratedScheduleApi} from '../services/api.js'
import { initialSchedule, initialScheduleEmpty, week } from '../MockData.js';

function GeneratedSchedule({
    onPageChange,
    employees,
    setEmployees,
    isLoading,
    setIsLoading
}) {
    const [scheduleData, setScheduleData] = useState(initialScheduleEmpty);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
        const scheduleResponse = await GeneratedScheduleApi.getGeneratedSchedule();
        setScheduleData(scheduleResponse.data);

        console.log('Fetched schedule:', scheduleResponse.data);
        } catch (error) {
        console.error('Erro ao carregar dados da API:', error);
        setScheduleData(initialSchedule);
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