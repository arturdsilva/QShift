import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import ScheduleTable from '../components/ScheduleTable';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedScheduleApi } from '../services/api.js';
import { ShiftConfigApi } from '../services/api.js';
import { daysOfWeek } from '../constants/constantsOfTable.js';

function GeneratedSchedule({
  employees,
  setEmployees,
  isLoading,
  setIsLoading,
  weekData,
  setWeekData,
  shiftsData,
  setShiftsData,
  previewSchedule,
  setPreviewSchedule,
}) {
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState(previewSchedule);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!previewSchedule) return;
    if (isLoading) {
      setIsLoading(false);
    }
  }, [previewSchedule]);

  const handleCancel = async () => {
    setWeekData(null);
    setShiftsData(null);
    setPreviewSchedule(null);
    navigate('/staff');
  };

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleShiftsSchedule = (responseShifts) => {
    return {
      shifts: responseShifts.map((respShift, index) => {
        const day = daysOfWeek[respShift.weekday];

        const previewShift = scheduleData[day]?.find(
          (s) =>
            s.startTime === respShift.start_time.slice(0, 5) &&
            s.endTime === respShift.end_time.slice(0, 5) &&
            s.minEmployees === respShift.min_staff,
        );

        return {
          shift_id: respShift.id,
          employee_ids: previewShift ? previewShift.employees.map((e) => e.id) : [],
        };
      }),
    };
  };

  async function handleApproved() {
    let newWeek = null;

    try {
      console.log('Criando semana:', weekData);
      newWeek = await ShiftConfigApi.submitWeekData(weekData).then((r) => r.data);
      console.log('Semana criada com sucesso:', newWeek);

      const createdShifts = await Promise.all(
        shiftsData.map((shift) =>
          ShiftConfigApi.createShift(newWeek.id, shift).then((r) => r.data),
        ),
      );

      const shiftsSchedule = handleShiftsSchedule(createdShifts);
      console.log('Todos os turnos criados com sucesso!');

      await GeneratedScheduleApi.approvedSchedule(newWeek.id, shiftsSchedule);

      alert('Escala criada com sucesso!');
      navigate('/staff');
    } catch (error) {
      console.error('Erro ao aprovar:', error);

      if (newWeek) {
        await GeneratedScheduleApi.deleteSchedule(newWeek.id).catch((e) =>
          console.error('Erro ao deletar semana:', e),
        );
      }

      alert('Erro ao aprovar a escala.');
      setWeekData(null);
      setShiftsData(null);
      setPreviewSchedule(null);
      navigate('/staff');
    }
  }

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={7}>
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
    <BaseLayout showSidebar={false} currentPage={7}>
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
              <div className="px-2 py-1.5 rounded text-center font-medium">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="justify-end flex flex-1">
              <div className="px-2 py-1.5 rounded text-center font-medium">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Edit
                </button>
              </div>
              <div className="px-2 py-1.5 rounded text-center font-medium">
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
              <div className="px-40 py-1.5 rounded text-center font-medium">
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
