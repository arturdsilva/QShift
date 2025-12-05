import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  METRIC_COLORS,
  STATS_CONFIG,
  METRIC_TITLES,
  COLORS_CHART,
} from '../constants/employeeStatsConfig.js';
import { EmployeeReportsApi } from '../services/api.js';
import BarChart from '../components/BarChart.jsx';
import { months } from '../constants/constantsOfTable.js';

function EmployeeSelector({ employeesList, currentEmployee, onToggleEmployee, month, year }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl w-full border border-slate-700 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-lg">
            <User className="text-blue-400" size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-200">Employees</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="text-slate-400" size={20} />
        ) : (
          <ChevronDown className="text-slate-400" size={20} />
        )}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
          <div className="space-y-1 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {employeesList.map((emp) => {
              const isSelected = emp.id === currentEmployee.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => onToggleEmployee(emp, month, year)}
                  className={`w-full px-3 py-2.5 rounded-lg text-left transition-all flex items-center gap-3 group ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-md ${isSelected ? 'bg-white/20' : 'bg-slate-700 group-hover:bg-slate-600'}`}
                  >
                    <User size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                  </div>
                  <span className="font-medium text-sm truncate">{emp.name}</span>
                  {isSelected && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeReportsPage({
  isLoading,
  setIsLoading,
  employeesList,
  currentEmployee,
  setCurrentEmployee,
}) {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMetric, setSelectedMetric] = useState('daysWorked');
  const [employeeYearStats, setEmployeeYearStats] = useState(null);
  const [statsCards, setStatsCards] = useState([]);

  const convertEmployeeStatsFormat = (stats) => {
    return {
      name: stats.name,
      monthsData: stats.months_data.map((monthData) => ({
        hoursWorked: monthData.hours_worked,
        daysOff: monthData.num_days_off,
        daysWorked: monthData.num_days_worked,
        monrningShifts: monthData.num_morning_shifts,
        afternoonShifts: monthData.num_afternoon_shifts,
        nightShifts: monthData.num_night_shifts,
      })),
    };
  };

  const createStatsCards = (employeeStatsFormatted) => {
    return STATS_CONFIG.map((config) => ({
      ...config,
      ...METRIC_COLORS[config.key],
      value: config.suffix
        ? `${employeeStatsFormatted.monthsData[currentMonth - 1][config.key]}${config.suffix}`
        : employeeStatsFormatted.monthsData[currentMonth - 1][config.key],
    }));
  };

  useEffect(() => {
    if (!currentEmployee && employeesList.length > 0) {
      setCurrentEmployee(employeesList[0]);
    }
    async function fetchEmployeeStats() {
      try {
        const response = await EmployeeReportsApi.getEmployeeYearStats(
          currentEmployee.id,
          currentYear,
        );
        if (response.data) {
          console.log('Raw employee stats data:', response.data);
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
    console.log('Selecionando relatório do funcionário:', employee, month, year);
    setCurrentEmployee(employee);
  };

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
    navigate('/reports');
  };

  if (isLoading) {
    return (
      <BaseLayout showSidebar={false} currentPage={10}>
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
    <BaseLayout showSidebar={false} currentPage={10}>
      <Header title={'Employees Reports'} icon={BarChart3}></Header>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-80 shrink-0">
          <EmployeeSelector
            employeesList={employeesList}
            currentEmployee={currentEmployee}
            onToggleEmployee={handleToggleEmployee}
            month={currentMonth}
            year={currentYear}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex gap-2 flex-wrap mb-4 justify-center lg:justify-start">
            {statsCards.map((card) => (
              <div
                key={card.key}
                className={`bg-slate-800 rounded-lg p-3 w-40 border border-slate-700 hover:${card.borderColor} transition-colors`}
              >
                <p className="text-sm text-slate-300">{card.label}</p>
                <p
                  className={`text-4xl font-bold ${card.textColor} max-w-full break-all leading-none`}
                >
                  {card.value}
                </p>
                <p className="text-xs text-slate-400">
                  {months[currentMonth - 1]} {currentYear}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
            <div className="flex flex-col lg:flex-row items-center mb-4 gap-4">
              <h3 className="text-lg font-semibold text-slate-200 w-full lg:w-auto text-center lg:text-left">
                Select Metric to Display
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto lg:ml-auto">
                <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg hover:bg-slate-600 transition-colors bg-slate-700/80"
                    title="Previous month"
                  >
                    <ChevronLeft size={24} className="text-slate-300" />
                  </button>

                  <span className="text-xl text-slate-200 font-medium min-w-[120px] text-center">
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

                <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handlePrevYear}
                    className="p-2 rounded-lg hover:bg-slate-600 transition-colors bg-slate-700/80"
                    title="Previous Year"
                  >
                    <ChevronLeft size={24} className="text-slate-300" />
                  </button>

                  <span className="text-xl text-slate-200 font-medium min-w-[80px] text-center">
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
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {STATS_CONFIG.map((metric) => (
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

          <div className="mt-1.5 bg-slate-800 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold text-slate-200 px-6 py-2 border-b border-slate-700">
              {METRIC_TITLES[selectedMetric]} - {currentYear}
            </h3>
            <div
              style={{
                height: '400px',
                padding: '24px',
              }}
            >
              {(() => {
                const data = {
                  labels: months,
                  datasets: [
                    {
                      label: METRIC_TITLES[selectedMetric],
                      data: employeeYearStats.monthsData.map(
                        (monthData) => monthData[selectedMetric],
                      ),
                      backgroundColor: months.map((_, index) => {
                        return index + 1 === currentMonth
                          ? METRIC_COLORS[selectedMetric].bgActiveHex
                          : METRIC_COLORS[selectedMetric].bgInactiveHex;
                      }),
                    },
                  ],
                };
                const options = {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: COLORS_CHART.textColorAxis,
                      },
                      grid: {
                        color: COLORS_CHART.gridColor,
                      },
                    },
                    x: {
                      ticks: {
                        color: COLORS_CHART.textColorAxis,
                      },
                      grid: { display: false },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: COLORS_CHART.bgChart,
                      displayColors: false,
                      titleColor: METRIC_COLORS[selectedMetric].textColorAxis,
                      bodyColor: METRIC_COLORS[selectedMetric].textColorHex,
                      borderColor: METRIC_COLORS[selectedMetric].borderColorHex,
                      borderWidth: 1,
                    },
                  },
                };
                return (
                  <BarChart
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
      <div className="flex-1 justify-start flex mt-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full lg:w-auto"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>
    </BaseLayout>
  );
}

export default EmployeeReportsPage;
