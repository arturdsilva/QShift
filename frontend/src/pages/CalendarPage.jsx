import { Calendar, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft} from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout';
import CalendarTable from '../components/CalendarTable';
import Header from '../components/Header';

function CalendarPage ({ 
  onPageChange,
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  selectedWeek,
  setSelectedWeek,
  selectedDays,
  setSelectedDays
  }) {

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
    setSelectedDays(prev => {
      if (prev.some(d => d.toISOString().split('T')[0] === dateStr)) {
        return prev.filter(d => d.toISOString().split('T')[0] !== dateStr);
      }
      return [...prev, date].sort((a, b) => a - b);
    });
  };

  const toggleWeek = (week, weekIdx) => {
    setSelectedWeek(weekIdx + 1);
    setSelectedDays([...week].sort((a, b) => a - b));
  };

  const handleAdvance = () => {
    if (selectedWeek && selectedDays.length > 0) {
      console.log('Avançando com:', { selectedWeek, selectedDays });
      onPageChange(5);
    }
  };

  const handleBack = () => {
    onPageChange(0);
  };

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

  return (
    <BaseLayout 
      showSidebar={true} 
      showSelectionPanel={true}
      selectionPanelData={{ selectedWeek, selectedDays }}
      currentPage={1}
      onPageChange={onPageChange}
    >
      <Header title="Calendar" icon={Calendar}>
        <div className="flex items-center gap-4 ml-8">
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
      />
      <div className="flex mt-4">
        <div className="flex-1 justify-start flex">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="justify-end flex flex-1">
          <button
            onClick={handleAdvance}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Next
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </BaseLayout>
  );
}

export default CalendarPage;
