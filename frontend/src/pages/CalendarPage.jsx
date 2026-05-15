import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { MolPageHeader } from '../atomic/MolPageHeader';
import { ObjCalendarTable } from '../atomic/ObjCalendarTable';
import { Button } from '../atomic/AtmButton/index.js';
import { AtmText } from '../atomic/AtmText/index.js';
import { CalendarApi } from '../services/api.js';
import { months } from '../constants/constantsOfTable.js';
import { MolLoadingPage } from '../atomic/MolLoadingPage';
import './CalendarPage.css';

function CalendarPage({
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  selectedWeek,
  setSelectedWeek,
  selectedDays,
  setSelectedDays,
  startDate,
  setStartDate,
  isLoading,
  setIsLoading,
  employees,
}) {
  const navigate = useNavigate();
  const [generatedWeeks, setGeneratedWeeks] = useState([]);

  useEffect(() => {
    if (employees.length === 0) {
      navigate('/staff');
      return;
    }
    async function getWeeks() {
      try {
        const weekResponse = await CalendarApi.getWeeks();
        setGeneratedWeeks(weekResponse.data);
        setSelectedDays([]);
        setSelectedWeek(null);
      } catch (error) {
        console.error('Error loading received weeks data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getWeeks();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDays([]);
    setSelectedWeek(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDays([]);
    setSelectedWeek(null);
  };

  const toggleDay = (date, isSelectedWeek) => {
    if (isSelectedWeek === false) return;
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDays((prev) => {
      if (prev.some((d) => d.toISOString().split('T')[0] === dateStr)) {
        if (prev.length === 1) {
          setSelectedWeek(null);
          setStartDate(null);
        }
        return prev.filter((d) => d.toISOString().split('T')[0] !== dateStr);
      }
      return [...prev, date].sort((a, b) => a - b);
    });
  };

  const toggleWeek = (week, weekIdx) => {
    setSelectedWeek(weekIdx + 1);
    setSelectedDays([...week].sort((a, b) => a - b));
    setStartDate(week[0]);
  };

  const handleAdvance = () => {
    if (selectedWeek && selectedDays.length > 0) navigate('/shift-config');
  };

  const handleBack = () => navigate('/staff');

  if (isLoading) return (
    <BaseLayout currentPage={2} showSidebar={false}>
      <MolLoadingPage />
    </BaseLayout>
  );

  return (
    <BaseLayout showSidebar={true} showSelectionPanel={true} selectionPanelData={{ startDate, selectedDays }} currentPage={2}>
      <MolPageHeader title="Calendar" icon={Calendar}>
        <div className="calendar-page__nav">
          <Button onClick={handlePrevMonth} variant="periodNav" title="Previous month">
            <ChevronLeft size={24} />
          </Button>
          <AtmText as="span" size="xl" weight="medium" color="white" className="calendar-page__month-label">
            {months[currentMonth - 1]} {currentYear}
          </AtmText>
          <Button onClick={handleNextMonth} variant="periodNav" title="Next month">
            <ChevronRight size={24} />
          </Button>
        </div>
      </MolPageHeader>

      <ObjCalendarTable
        currentMonth={currentMonth}
        currentYear={currentYear}
        selectedDays={selectedDays}
        selectedWeek={selectedWeek}
        onToggleDay={toggleDay}
        onToggleWeek={toggleWeek}
        generatedWeeks={generatedWeeks}
      />

      <div className="calendar-page__actions">
        <Button onClick={handleBack} responsive variant='primary' size='lg'>
          <ArrowLeft size={24} />
          Back
        </Button>
        <Button onClick={handleAdvance} responsive className="calendar-page__next-btn" variant='primary' size='lg'>
          Next
          <ArrowRight size={24} />
        </Button>
      </div>
    </BaseLayout>
  );
}

export default CalendarPage;
