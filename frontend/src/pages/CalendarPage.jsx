import { Calendar, ChevronLeft, ChevronRight} from 'lucide-react';
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
      // TODO: Aqui faria a chamada à API
      onPageChange(5);
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <BaseLayout 
      showSidebar={true} 
      showSelectionPanel={true}
      selectionPanelData={{ selectedWeek, selectedDays }}
      currentPage={0}
      onPageChange={onPageChange}
    >
      <Header title="Calendário" icon={Calendar}>
        <div className="flex items-center gap-4 ml-8">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft size={24} className="text-slate-300" />
          </button>
          
          <span className="text-xl text-slate-200 font-medium min-w-[200px] text-center">
            {months[currentMonth - 1]} {currentYear}
          </span>
          
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            title="Próximo mês"
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
        onAdvance={handleAdvance}
      />
    </BaseLayout>
  );
}

export default CalendarPage;
