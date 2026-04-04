import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { MolPageHeader } from '../atomic/MolPageHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, RotateCcw, Calendar, Trash2, ArrowLeft, Users } from 'lucide-react';
import { daysOfWeek } from '../constants/constantsOfTable.js';
import { Button } from '../atomic/AtmButton/index.js';
import { AtmInput } from '../atomic/AtmInput/index.js';
import { AtmText } from '../atomic/AtmText/Text.jsx';
import { ObjRetryStatusBanner } from '../atomic/ObjRetryStatusBanner';
import { useScheduleCreate } from '../hooks/useScheduleGeneration';
import { STATUS } from '../hooks/useRetryOnSleep';
import { MolShiftChip } from '../atomic/MolShiftChip/index.js';
import { TemplateItem } from '../atomic/MolScheduleTemplateItem/index.js';
import { ObjCreateShiftModal } from '../atomic/ObjCreateShiftModal';

function ShiftConfigPage({
  selectedDays,
  startDate,
  setWeekData,
  setShiftsData,
  setPreviewSchedule,
}) {
  const navigate = useNavigate();
  const openDaysMask = [];
  const selectedDaysMap = {};

  const { run, status, retryCountdown, retriesLeft, errorInfo, getMessage } = useScheduleCreate();
  const isBusy = status === STATUS.RUNNING || status === STATUS.WAKING_UP;
  const [showModal, setShowModal] = useState(false);

  // função para Ondrop
  const handleOnDrop = () => {

  }

  // handle save
  const handleSaveShift = () => {

  }

  const handleSaveDay = () => {

  }

  const handleSaveWeek = () => {

  }


  useEffect(() => {
    if (!startDate || !selectedDays || selectedDays.length === 0) navigate('/staff');
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

  const handleBack = () => navigate('/calendar');

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
            errors.push(`${labelShift}: End time must be after start time.`); return;
          }
          if (shift.min_staff && Number(shift.min_staff) < 0) {
            errors.push(`${labelShift}: Minimum number of employees must be greater than 0.`); return;
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
    if (errors.length > 0) return { success: false, errors };
    if (shiftsSchedule.length === 0)
      return { success: false, errors: ['Please configure at least one complete shift (with start time, end time, and number of employees).'] };
    setShiftsData(shiftsSchedule);
    return { success: true, data: shiftsSchedule };
  };

  const convertScheduleData = (shifts) => {
    let scheduleModified = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [] };
    shifts.forEach((shift, index) => {
      const dayName = daysOfWeek[shift.weekday];
      scheduleModified[dayName].push({
        id: `${dayName}-${index}`,
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
        minEmployees: shift.min_staff,
        employees: shift.employees.map((emp) => ({ id: emp.employee_id, name: emp.name })),
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
    if (!result.success) {
      const errorMessage = result.errors.join('\n\n');
      alert(`Please fix the following issues:\n\n${errorMessage}`);
      return;
    }
    const shiftsSchedule = result.data;
    const week = { start_date: startDate.toISOString().split('T')[0], open_days: openDaysMask };
    setWeekData(week);

    const response = await run({ shift_vector: shiftsSchedule });

    if (response?.success) {
      const previewScheduleData = response.data.result;
      if (previewScheduleData?.possible && previewScheduleData.schedule) {
        const convertedData = convertScheduleData(previewScheduleData.schedule.shifts);
        setPreviewSchedule(convertedData);
        navigate('/schedule');
      } else {
        alert('Unable to generate a viable schedule with the current settings. Check shift and employee settings.');
        navigate('/staff');
      }
    }
  };

  return (
    <BaseLayout showSidebar={false} currentPage={6} showSelectionPanel={true} selectionPanelData={{ startDate, selectedDays }}>
      <MolPageHeader title="Shift Configuration" />

      <ObjRetryStatusBanner
        status={status}
        retryCountdown={retryCountdown}
        retriesLeft={retriesLeft}
        errorInfo={errorInfo}
        getMessage={getMessage}
        onRetry={createSchedule}
      />
      {/* TODO: pode mudar o bg dos templates e do MolShiftChip, mas ai tem que mudar lá no arquivo */}
      {/* TODO: fazer o sidebar com a molecula TemplateItem de shift, day e schedule, seria interessante colocar uma lógica de scroll caso a quantidade de itens seja grande */}
      {/* TODO: fazer o weekgrid de visualização da configuração de turnos da semana com suas funcionallidades */}


      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
        <div className="order-3 md:order-none col-span-1 md:flex-1 justify-start flex">
          <Button onClick={handleBack} variant='primary' size='lg' disabled={isBusy}>
            <ArrowLeft size={20} />
            Back
          </Button>
        </div>
        <Button onClick={createSchedule} variant='primary' className="order-4 md:order-none ml-auto" size='lg' disabled={isBusy}>
          <Calendar className="w-4 h-4" />
          {isBusy ? 'Generating…' : 'Create Schedule'}
        </Button>
      </div>
      {showModal && (
        <ObjCreateShiftModal
          onSave={(data) => { console.log('saved:', data); setShowModal(false); }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </BaseLayout>
  );
}

export default ShiftConfigPage;
