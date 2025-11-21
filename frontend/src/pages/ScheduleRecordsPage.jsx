import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import ScheduleTable from '../components/ScheduleTable';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GeneratedScheduleApi } from '../services/api.js';
import { exportToCSV } from '../utils/exportSchedule.js';

function ScheduleRecordsPage({
  employees,
  setEmployees,
  isLoading,
  setIsLoading,
  weeksList,
  setWeeksList,
  weekRecords,
  setWeekRecords,
  currentIdxWeek,
  setCurrentIdxWeek,
}) {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const days_of_week = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const [schedulesCache, setSchedulesCache] = useState({});
  console.log('week', weekRecords);
  const convertScheduleData = (shifts) => {
    const scheduleModified = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
    shifts.forEach((shift) => {
      const dayName = days_of_week[shift.weekday];
      scheduleModified[dayName].push({
        id: shift.shift_id,
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
        minEmployees: shift.min_staff,
        employees: shift.employees.map((emp) => ({
          id: emp.employee_id,
          name: emp.name,
        })),
      });
    });
    console.log('setou scheduleData', scheduleData);
    return scheduleModified;
  };

  const formatWeekPeriod = (week) => {
    if (!week || !week.start_date) return '';
    const [yearStartDate, monthStartDate, dayStartDate] = week.start_date.split('-').map(Number);
    const startDate = new Date(yearStartDate, monthStartDate - 1, dayStartDate);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const startMonth = months[startDate.getMonth()];
    const endMonth = months[endDate.getMonth()];

    if (startMonth === endMonth) {
      return `${startDate.getDate()}-${endDate.getDate()} ${startMonth} ${startDate.getFullYear()}`;
    }
    return `${startDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth} ${startDate.getFullYear()}`;
  };

  useEffect(() => {
    console.log('entrou useEffect');
    async function generateSchedule() {
      if (!weekRecords?.id) {
        setIsLoading(false);
        return;
      }
      if (schedulesCache[weekRecords.id]) {
        setScheduleData(schedulesCache[weekRecords.id]);
        return;
      }
      try {
        const response = await GeneratedScheduleApi.getGeneratedSchedule(weekRecords.id);
        console.log('GeneratedScheduleApi', response.data);
        if (response.data) {
          const convertedData = convertScheduleData(response.data.shifts);
          setScheduleData(convertedData);
          console.log('Turnos:', response.data.shifts);
          setSchedulesCache((prev) => ({
            ...prev,
            [weekRecords.id]: convertedData,
          }));
        }
      } catch (error) {
        console.error('Erro ao receber a escala:', error);
        alert('Nenhuma escala foi gerada ainda.');
      } finally {
        setIsLoading(false);
      }
    }
    generateSchedule();
  }, [weekRecords?.id]);
  console.log('saiu useEffect');
  const previousWeek = () => {
    if (weeksList.length - 1 > currentIdxWeek) {
      setWeekRecords(weeksList[currentIdxWeek + 1]);
      setCurrentIdxWeek(currentIdxWeek + 1);
      setEditMode(false);
    }
  };

  const nextWeek = () => {
    if (currentIdxWeek > 0) {
      setWeekRecords(weeksList[currentIdxWeek - 1]);
      setCurrentIdxWeek(currentIdxWeek - 1);
      setEditMode(false);
    }
  };

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  const handleShiftsSchedule = () => {
    const shiftsSchedule = { shifts: [] };
    days_of_week.forEach((day) => {
      if (scheduleData[day]) {
        scheduleData[day].forEach((shift) => {
          shiftsSchedule.shifts.push({
            shift_id: shift.id,
            employee_ids: shift.employees.map((employee) => employee.id),
          });
        });
      }
    });
    console.log('shiftsSchedule', shiftsSchedule);
    return shiftsSchedule;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const shiftsSchedule = handleShiftsSchedule();
      await GeneratedScheduleApi.deleteShiftsSchedule(weekRecords.id);
      setSchedulesCache((prev) => ({
        ...prev,
        [weekRecords.id]: scheduleData,
      }));
      await GeneratedScheduleApi.approvedSchedule(weekRecords.id, shiftsSchedule);
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao salvar a escala:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }

    setEditMode(false);
  };

  const handleBack = () => {
    navigate('/reports');
  };

  const handleExportCSV = () => {
    if (!scheduleData || !weekRecords) {
      alert('No schedule data to export');
      return;
    }
    try {
      exportToCSV(scheduleData, weekRecords, employees);
      console.log('Schedule exported to CSV successfully');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Error exporting schedule to CSV. Please try again.');
    }
  };

  const handleDeleteSchedule = async () => {
    setIsLoading(true);
    try {
      await GeneratedScheduleApi.deleteSchedule(weekRecords.id);
      setSchedulesCache((prev) => {
        const updatedCache = { ...prev };
        delete updatedCache[weekRecords.id];
        return updatedCache;
      });
      if (weeksList.length === 1) {
        setWeekRecords(null);
        setCurrentIdxWeek(0);
        navigate('/reports');
      } else {
        const newWeeksList = weeksList.filter((week) => week.id !== weekRecords.id);
        setWeeksList(newWeeksList);
        if (currentIdxWeek === 0) {
          setWeekRecords(newWeeksList[0]);
        } else {
          setWeekRecords(newWeeksList[currentIdxWeek - 1]);
          setCurrentIdxWeek(currentIdxWeek - 1);
        }
      }
    } catch (error) {
      console.log('Erro ao deletar a escala:', error);
      throw error;
    } finally {
      setEditMode(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={8}>
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
      showSelectionPanel={true}
      selectionPanelData={null}
      currentPage={8}
    >
      <Header title={'Schedule Records'} icon={CalendarRange}>
        <div className="flex items-center gap-4 ml-8">
          <button
            onClick={previousWeek}
            disabled={weeksList.length - 1 <= currentIdxWeek}
            className={`p-2 rounded-lg text-xonter  ${
              weeksList.length - 1 <= currentIdxWeek
                ? `opacity-50 cursor-not-allowed`
                : `hover:bg-slate-700`
            }`}
            title="Previous week"
          >
            <ChevronLeft size={24} className="text-slate-300" />
          </button>
          <div
            className={`flex items-center gap-2 ${weekRecords ? `min-w-[250px] justify-center` : `justify-center`}`}
          >
            <span className="text-lg text-slate-200 font-medium">
              {formatWeekPeriod(weekRecords)}
            </span>
          </div>
          <button
            onClick={nextWeek}
            disabled={currentIdxWeek <= 0}
            className={`p-2 rounded-lg ${
              currentIdxWeek <= 0 ? `opacity-50 cursor-not-allowed` : `hover:bg-slate-700`
            }`}
            title="Next month"
          >
            <ChevronRight size={24} className="text-slate-300" />
          </button>
          <div className="text-sm text-slate-400 ml-4">
            {weeksList.length > 0 ? `Week ${currentIdxWeek + 1} of ${weeksList.length}` : ``}
          </div>
        </div>
      </Header>
      <div>
        {weeksList.length <= 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-slate-400 text-lg">No weekly schedule created</p>
            </div>
          </div>
        ) : (
          <>
            {editMode && (
              <div className="flex mb-2 p-2 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-200" />
                <p className="px-2.5 text-yellow-200 text-sm">
                  Editing mode is active. Remember to save your changes.
                </p>
              </div>
            )}
            <ScheduleTable
              scheduleData={scheduleData}
              setScheduleData={setScheduleData}
              employeeList={employees}
              week={weekRecords}
              editMode={editMode}
            />
          </>
        )}
        {!editMode ? (
          <div className="flex mt-4">
            <div className="flex-1 justify-start flex">
              <div className="px-2 py-1.5 rounded text-center font-medium">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Back
                </button>
              </div>
            </div>

            {weeksList.length > 0 && (
              <div className="justify-end flex flex-1 gap-2">
                <div className="px-2 py-1.5 rounded text-center font-medium">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium sm:w-auto whitespace-nowrap"
                    title="Export schedule to CSV"
                  >
                    <FileSpreadsheet size={20} />
                    Export CSV
                  </button>
                </div>
                <div className="px-1 py-1.5 rounded text-center font-medium">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium sm:w-auto sm:ml-auto"
                  >
                    {`Edit`}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex mt-4">
            <div className="justify-end flex flex-1">
              <div className="px-5 py-1.5 rounded text-center font-medium">
                <button
                  onClick={handleDeleteSchedule}
                  className="items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  {`Delete`}
                </button>
              </div>
            </div>
            <div className="justify-end flex">
              <div className="px-2 py-1.5 rounded text-center font-medium">
                <button
                  onClick={handleSave}
                  className="items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {`Save`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}

export default ScheduleRecordsPage;
