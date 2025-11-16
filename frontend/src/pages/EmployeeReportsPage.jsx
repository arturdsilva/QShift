import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState, useEffect, use } from 'react';
import {BarChart3, ChevronLeft, ChevronRight} from 'lucide-react';
import { METRIC_COLORS, STATS_CONFIG, METRIC_TITLES } from '../constants/employeeStatsConfig.js';
import { EmployeeReportsApi } from '../services/api.js';

function EmployeeSelector({
    employeesList,
    currentEmployee,
    onToggleEmployee,
    month,
    year
}) {
  return (
      <div className='bg-slate-800 p-6 rounded-lg shadow-xl max-w-md border border-slate-700'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold text-slate-200'>Employees</h3>
        </div>
        <div className='space-y-2 max-h-96 overflow-y-auto mb-6'>
          {employeesList.map(emp => {
            const isSelected = emp.id === currentEmployee.id;
            return (
              <button
                onClick={() => onToggleEmployee(emp, month, year)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{emp.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
  );
}

function EmployeeReportsPage({
    onPageChange,
    isLoading,
    setLoading,
    employeesList,
    currentEmployee,
    setCurrentEmployee
}) {
    // Dados mockados para demonstração
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedMetric, setSelectedMetric] = useState('daysWorked');
    const [employeeYearStats, setEmployeeYearStats] = useState(null);
    const [statsCards, setStatsCards] = useState([]);

    const employaeeYearStats = {
        name: "employee x",
        months_data: [
            {
                name: "employee x",
                month_data: {
                    hoursWorked: 4,
                    daysOff: 22,
                    daysWorked: 176,
                    morningShifts: 11,
                    afternoonShifts: 11,
                    nightShifts: 0
                }
            }
        ]
    };

    const createStatsCards = (employeeStats) => {
        return STATS_CONFIG.map(config => ({
            ...config,
            ...METRIC_COLORS[config.key],
            value: config.suffix 
                ? `${employeeStats.months_data[currentMonth - 1][config.key]}${config.suffix}` 
                : employeeStats.months_data[currentMonth - 1][config.key]
        }));
    }

    useEffect(() => {
        if (!currentEmployee && employeesList.length > 0) {
            setCurrentEmployee(employeesList[0]);
        }
        async function fetchEmployeeStats() {
            setLoading(true);
            try {
                const response = await EmployeeReportsApi.getEmployeeYearStats(
                    currentEmployee.id,
                    currentYear
                );
                if (response.data) {
                    setEmployeeYearStats(response.data);
                    const statsCards = createStatsCards(response.data);
                    setStatsCards(statsCards);
                    console.log('Estatísticas do funcionário recebidas com sucesso:', response.data);
                }
            } catch (error) {
                console.error('Erro ao buscar estatísticas do funcionário:', error);
            } finally {
                setLoading(false);
            }
        }
        if (currentEmployee) {
            fetchEmployeeStats();
        }
    }, [currentEmployee, currentMonth, currentYear]);

    const handleToggleEmployee = (employee, month, year) => {
        console.log("Selecionando relatório do funcionário:", employee, month, year);
        setCurrentEmployee(employee);
        // No futuro vou implmentar um fetch para pegar os dados estatísticos do funcionário selecionado e vou vou tornar essa função assíncrona
    }

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePrevMonth = () => {
        if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
        } else {
        setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
        } else {
        setCurrentMonth(currentMonth + 1);
        }
    };

    const handlePrevYear = () => {
        setCurrentYear(currentYear - 1);
    };

    const handleNextYear = () => {
        setCurrentYear(currentYear + 1);
    };

    if (isLoading) {
        return (
            <BaseLayout showSidebar={false} currentPage={8} onPageChange={onPageChange}>
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
            currentPage={10}
            onPageChange={onPageChange}
        >
            <Header title={"Employees Reports"} icon={BarChart3} >
                <div className="flex items-center gap-4 ml-8">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Previous month"
                    >
                        <ChevronLeft size={24} className="text-slate-300" />
                    </button>
                    
                    <span className="text-xl text-slate-200 font-medium min-w-[200px] text-center">
                        {months[currentMonth - 1]}
                    </span>
                    
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Next month"
                    >
                        <ChevronRight size={24} className="text-slate-300" />
                    </button>
                </div>
                <div className="flex items-center gap-4 ml-8">
                    <button
                        onClick={handlePrevYear}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Previous Year"
                    >
                        <ChevronLeft size={24} className="text-slate-300" />
                    </button>
                    
                    <span className="text-xl text-slate-200 font-medium min-w-[200px] text-center">
                        {currentYear}
                    </span>
                    
                    <button
                        onClick={handleNextYear}
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                        title="Next Year"
                    >
                        <ChevronRight size={24} className="text-slate-300" />
                    </button>
                </div>
            </Header>
            <div className='flex gap-5'>
                <EmployeeSelector
                    employeesList={employeesList}
                    currentEmployee={currentEmployee}
                    onToggleEmployee={handleToggleEmployee}
                    month={currentMonth}
                    year={currentYear}
                />
                <div className='flex-1'>
                    <div className='flex gap-2 flex-wrap mb-5'>
                        {statsCards.map(card => (
                            <div 
                                key={card.key}
                                className={`bg-slate-800 rounded-lg p-4 w-56 border border-slate-700 hover:${card.borderColor} transition-colors`}
                            >
                                <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                                <p className={`text-5xl font-bold ${card.textColor} mb-1`}>{card.value}</p>
                                <p className="text-xs text-slate-500">{months[currentMonth - 1]} {currentYear}</p>
                            </div>
                        ))}
                    </div>

                    <div className='bg-slate-800 rounded-lg px-4 py-1.5 border border-slate-700'>
                        <h3 className='text-lg font-semibold text-slate-200 mb-2'>Select Metric to Display</h3>
                        <div className='flex gap-2 flex-wrap'>
                            {STATS_CONFIG.map(metric => (
                                <button
                                    key={metric.key}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        selectedMetric === metric.key
                                        ? `${METRIC_COLORS[metric.key].bgButton} text-white shadow-lg`
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    } `}
                                    onClick={() => setSelectedMetric(metric.key)}
                                >
                                    {metric.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='mt-8'>
                        <div className='mb-4'>
                            Uma toolbar para seleção do do dado a ser exibido no gráfico
                        </div>
                        <div className=''>
                            Gráfico de barras mostrando: 
                            Dias trablahados no mês ||
                            Horas trabalhadas no mês ||
                            Folgas no mês ||
                            Turnos da manha no mês ||
                            Turnos da tarde no mês
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    )
}

export default EmployeeReportsPage;