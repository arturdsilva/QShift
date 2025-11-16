import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import {BarChart3, ChevronLeft, ChevronRight, ArrowLeft} from 'lucide-react';
import { METRIC_COLORS, STATS_CONFIG, METRIC_TITLES, COLORS_CHART } from '../constants/employeeStatsConfig.js';
import { EmployeeReportsApi } from '../services/api.js';
import BarChart from '../components/BarChart.jsx';

function EmployeeSelector({
    employeesList,
    currentEmployee,
    onToggleEmployee,
    month,
    year
}) {
  return (
      <div className='bg-slate-800 p-4 rounded-lg shadow-xl max-w-md border border-slate-700'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-xl font-bold text-slate-200'>Employees</h3>
        </div>
        <div className='space-y-2 max-h-96 overflow-y-auto mb-3 px-3'>
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
    setIsLoading,
    employeesList,
    currentEmployee,
    setCurrentEmployee
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedMetric, setSelectedMetric] = useState('daysWorked');
    const [employeeYearStats, setEmployeeYearStats] = useState(null);
    const [statsCards, setStatsCards] = useState([]);

    const convertEmployeeStatsFormat = (stats) => {
        return {
            name: stats.name,
            monthsData: stats.months_data.map(monthData => ({
                hoursWorked: monthData.hours_worked,
                daysOff: monthData.num_days_off,
                daysWorked: monthData.num_days_worked,
                monrningShifts: monthData.num_morning_shifts,
                afternoonShifts: monthData.num_afternoon_shifts,
                nightShifts: monthData.num_night_shifts
            }))
        };
    }

    const createStatsCards = (employeeStatsFormatted) => {
        return STATS_CONFIG.map(config => ({
            ...config,
            ...METRIC_COLORS[config.key],
            value: config.suffix 
                ? `${employeeStatsFormatted.monthsData[currentMonth - 1][config.key]}${config.suffix}` 
                : employeeStatsFormatted.monthsData[currentMonth - 1][config.key]
        }));
    }

    useEffect(() => {
        if (!currentEmployee && employeesList.length > 0) {
            setCurrentEmployee(employeesList[0]);
        }
        async function fetchEmployeeStats() {
            try {
                const response = await EmployeeReportsApi.getEmployeeYearStats(
                    currentEmployee.id,
                    currentYear
                );
                if (response.data) {
                    console.log("Raw employee stats data:", response.data);
                    const employeeStatsFormatted = convertEmployeeStatsFormat(response.data);
                    setEmployeeYearStats(employeeStatsFormatted);
                    const statsCards = createStatsCards(employeeStatsFormatted);
                    setStatsCards(statsCards);
                    console.log('Estatísticas do funcionário recebidas com sucesso:', response.data);
                }
            } catch (error) {
                console.error('Erro ao buscar estatísticas do funcionário:', error);
            } finally {
                setIsLoading(false);
            }
        }
        if (currentEmployee) {
            fetchEmployeeStats();
        }
    }, [currentEmployee, currentMonth, currentYear]);

    const handleToggleEmployee = (employee, month, year) => {
        console.log("Selecionando relatório do funcionário:", employee, month, year);
        setCurrentEmployee(employee);
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

    const handleBack = () => {
        onPageChange(3);
    };

    if (isLoading) {
        return (
            <BaseLayout showSidebar={false} currentPage={10} onPageChange={onPageChange}>
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
            </Header>
            <div className='flex gap-4'>
                <div className=''>
                    <EmployeeSelector
                        employeesList={employeesList}
                        currentEmployee={currentEmployee}
                        onToggleEmployee={handleToggleEmployee}
                        month={currentMonth}
                        year={currentYear}
                    />
                    <div className="flex-1 justify-start flex mt-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Back
                            <ArrowLeft size={20} />
                        </button>
                    </div>
                </div>

                <div className='flex-1'>
                    <div className='flex gap-2 flex-wrap mb-4'>
                        {statsCards.map(card => (
                            <div 
                                key={card.key}
                                className={`bg-slate-800 rounded-lg p-3 w-40 border border-slate-700 hover:${card.borderColor} transition-colors`}
                            >
                                <p className="text-sm text-slate-400">{card.label}</p>
                                <p className={`text-5xl font-bold ${card.textColor}`}>{card.value}</p>
                                <p className="text-xs text-slate-500">{months[currentMonth - 1]} {currentYear}</p>
                            </div>
                        ))}
                    </div>

                    <div className='bg-slate-800 rounded-lg px-4 py-1.5 border border-slate-700'>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-lg font-semibold text-slate-200 mb-2'>Select Metric to Display</h3>       
                            <div className="flex items-center ml-64">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 rounded-lg hover:bg-slate-600 transition-colors bg-slate-700/80"
                                    title="Previous month"
                                >
                                    <ChevronLeft size={24} className="text-slate-300" />
                                </button>
                                
                                <span className="text-xl text-slate-200 font-medium min-w-[150px] text-center">
                                    {months[currentMonth - 1]}
                                </span>
                                
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 rounded-lg hover:bg-slate-600 transition-colors bg-slate-700/80"
                                    title="Next month"
                                >
                                    <ChevronRight size={24} className="text-slate-300" />
                                </button>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={handlePrevYear}
                                    className="p-2 rounded-lg hover:bg-slate-600 transition-colors bg-slate-700/80"
                                    title="Previous Year"
                                >
                                    <ChevronLeft size={24} className="text-slate-300" />
                                </button>
                                
                                <span className="text-xl text-slate-200 font-medium min-w-[150px] text-center">
                                    {currentYear}
                                </span>
                                
                                <button
                                    onClick={handleNextYear}
                                    className="p-2 rounded-lg hover:bg-slate-600 transition-colors bg-slate-700/80"
                                    title="Next Year"
                                >
                                    <ChevronRight size={24} className="text-slate-300" />
                                </button>
                            </div>             
                        </div>

                        <div className='flex gap-1.5 flex-wrap'>
                            {STATS_CONFIG.map(metric => (
                                <button
                                    key={metric.key}
                                    className={`px-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
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

                    <div className='mt-1.5 bg-slate-800 rounded-lg border border-slate-700'>
                        <h3 className='text-xl font-bold text-slate-200 px-6 py-2 border-b border-slate-700'>
                            {METRIC_TITLES[selectedMetric]} - {currentYear}
                        </h3>
                        <div style={{ height: '400px', padding: '24px' }}>
                            {(() => {
                                const data = {
                                    labels: months,
                                    datasets: [
                                        {
                                            label: METRIC_TITLES[selectedMetric],
                                            data: employeeYearStats.monthsData.map((monthData) => (
                                                monthData[selectedMetric]
                                            )),
                                            backgroundColor: months.map((_, index) => {
                                                return(index + 1 === currentMonth
                                                ? METRIC_COLORS[selectedMetric].bgActiveHex
                                                : METRIC_COLORS[selectedMetric].bgInactiveHex);
                                            })
                                        }
                                    ]
                                };
                                const options = {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {color: COLORS_CHART.textColorAxis},
                                            grid: {color: COLORS_CHART.gridColor}
                                        },
                                        x: {
                                            ticks: {color: COLORS_CHART.textColorAxis },
                                            grid: {display: false}
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            backgroundColor: COLORS_CHART.bgChart,
                                            displayColors: false,
                                            titleColor: METRIC_COLORS[selectedMetric].textColorAxis,
                                            bodyColor: METRIC_COLORS[selectedMetric].textColorHex,
                                            borderColor: METRIC_COLORS[selectedMetric].borderColorHex,
                                            borderWidth: 1
                                        }
                                    }
                                };
                                return (<BarChart
                                            key={`chart-${selectedMetric}-${currentYear}`} 
                                            data={data} 
                                            options={options} 
                                        />
                                );
                            })()}
                        </div>

                    </div>
                </div>
            </div>
        </BaseLayout>
    )
}

export default EmployeeReportsPage;