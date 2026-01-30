import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout';
import CalendarTable from '../components/CalendarTable';
import Header from '../components/Header';
import { CalendarApi } from '../services/api.js';
import { months } from '../constants/constantsOfTable.js';

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
    if (isSelectedWeek === false) {
      return;
    }
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
    if (selectedWeek && selectedDays.length > 0) {
      navigate('/shift-config');
    }
  };

  const handleBack = () => {
    navigate('/staff');
  };

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={2}>
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
      showSidebar={true}
      showSelectionPanel={true}
      selectionPanelData={{
        startDate,
        selectedDays,
      }}
      currentPage={2}
    >
      <Header title="Calendar" icon={Calendar}>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Previous month"
          >
            <ChevronLeft size={24} className="text-slate-300" />
          </button>

          <span className="text-xl text-slate-200 font-medium min-w-[200px] text-center">
            {months[currentMonth - 1]} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Next month"
          >
            <ChevronRight size={24} className="text-slate-300" />
          </button>
        </div>
      </Header>

      <CalendarTable
        currentMonth={currentMonth}
        currentYear={currentYear}
        selectedDays={selectedDays}
        selectedWeek={selectedWeek}
        onToggleDay={toggleDay}
        onToggleWeek={toggleWeek}
        generatedWeeks={generatedWeeks}
      />
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full sm:w-auto"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <button
          onClick={handleAdvance}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full sm:w-auto sm:ml-auto"
        >
          Next
          <ArrowRight size={20} />
        </button>
      </div>
    </BaseLayout>
  );
}

export default CalendarPage;
