import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { MolPageHeader } from '../atomic/MolPageHeader';
import { ObjEmployeeSelector } from '../atomic/ObjEmployeeSelector';
import { ObjStatsCards } from '../atomic/ObjStatsCards';
import { ObjChartHeader } from '../atomic/ObjChartHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft } from 'lucide-react';
import {
  METRIC_COLORS,
  STATS_CONFIG,
  METRIC_TITLES,
  COLORS_CHART,
} from '../constants/employeeStatsConfig.js';
import { EmployeeReportsApi } from '../services/api.js';
import { ObjBarChart } from '../atomic/ObjBarChart';
import { months } from '../constants/constantsOfTable.js';
import { Button } from '../atomic/AtmButton/index.js';
import { AtmText } from '../atomic/AtmText/index.js';
import { MolLoadingPage } from '../atomic/MolLoadingPage';
import {
  convertEmployeeStatsFormat,
  formatWorkedHours,
} from '../utils/employeeReportsUtils.js';
import './EmployeeReportsPage.css';

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

  const createStatsCards = (employeeStatsFormatted) =>
    STATS_CONFIG.map((config) => ({
      ...config,
      ...METRIC_COLORS[config.key],
      value: config.suffix
        ? `${formatWorkedHours(employeeStatsFormatted.monthsData[currentMonth - 1][config.key])}${config.suffix}`
        : employeeStatsFormatted.monthsData[currentMonth - 1][config.key],
    }));

  useEffect(() => {
    if (!currentEmployee) {
      if (employeesList.length > 0) {
        setCurrentEmployee(employeesList[0]);
      } else {
        // FIX (US-14): não usar alert() — navegar silenciosamente de volta
        navigate('/reports');
        return;
      }
    }
    async function fetchEmployeeStats() {
      try {
        // FIX (US-14): cache sessionStorage removido — sempre busca dados frescos da API
        // para evitar dados stale quando escalas são criadas/deletadas na mesma sessão.
        const response = await EmployeeReportsApi.getEmployeeYearStats(currentEmployee.id, currentYear);
        if (response.data) {
          const f = convertEmployeeStatsFormat(response.data);
          setEmployeeYearStats(f);
          setStatsCards(createStatsCards(f));
        }
      } catch (error) {
        console.error('Error fetching employee statistics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    if (currentEmployee) fetchEmployeeStats();
  }, [currentEmployee, currentMonth, currentYear]);

  const handleToggleEmployee = (employee) => setCurrentEmployee(employee);
  const handlePrevMonth = () => { if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); };
  const handleNextMonth = () => { if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); };
  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);
  const handleBack = () => navigate('/reports');

  // FIX (US-14): exibe mensagem na UI quando não há funcionários (sem alert())
  if (!isLoading && employeesList.length === 0) {
    return (
      <BaseLayout currentPage={10} showSidebar={false}>
        <div className="employee-reports__empty">
          <AtmText as="h2" size="xl" weight="bold" color="white">
            No employees available
          </AtmText>
          <AtmText as="p" size="md" color="muted">
            Add employees first to view their reports.
          </AtmText>
          <Button onClick={() => navigate('/reports')} variant="primary" size="md">
            <AtmText as="span" size="md" weight="bold" color="white">Back to Reports</AtmText>
          </Button>
        </div>
      </BaseLayout>
    );
  }

  if (isLoading) return (
    <BaseLayout currentPage={10} showSidebar={false}>
      <MolLoadingPage />
    </BaseLayout>
  );

  return (
    <BaseLayout showSidebar={false} currentPage={10}>
      <MolPageHeader title="Employees Reports" icon={BarChart3} />
      <div className="employee-reports__layout">
        <div className="employee-reports__sidebar">
          <ObjEmployeeSelector
            employeesList={employeesList}
            currentEmployee={currentEmployee}
            onToggleEmployee={handleToggleEmployee}
            month={currentMonth}
            year={currentYear}
          />
        </div>

        <div className="employee-reports__content">
          <ObjStatsCards statsCards={statsCards} currentMonth={currentMonth} currentYear={currentYear} />

          <ObjChartHeader
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onPrevYear={handlePrevYear}
            onNextYear={handleNextYear}
          />

          <div className="employee-reports__chart-wrapper">
            <AtmText as="h3" size="lg" weight="bold" color="white" className="employee-reports__chart-title">
              {METRIC_TITLES[selectedMetric]} - {currentYear}
            </AtmText>
            <div className="employee-reports__chart-container">
              {(() => {
                if (!employeeYearStats) {
                  return <AtmText as="p" size="xl" color="muted" className="employee-reports__no-data">No data available</AtmText>;
                }
                const data = {
                  labels: months,
                  datasets: [{
                    label: METRIC_TITLES[selectedMetric],
                    data: employeeYearStats.monthsData.map((monthData) => monthData[selectedMetric]),
                    backgroundColor: months.map((_, index) =>
                      index + 1 === currentMonth
                        ? METRIC_COLORS[selectedMetric].bgActiveHex
                        : METRIC_COLORS[selectedMetric].bgInactiveHex,
                    ),
                  }],
                };
                const options = {
                  responsive: true, maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, ticks: { color: COLORS_CHART.textColorAxis }, grid: { color: COLORS_CHART.gridColor } },
                    x: { ticks: { color: COLORS_CHART.textColorAxis }, grid: { display: false } },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: COLORS_CHART.bgChart, displayColors: false,
                      titleColor: METRIC_COLORS[selectedMetric].textColorAxis,
                      bodyColor: METRIC_COLORS[selectedMetric].textColorHex,
                      borderColor: METRIC_COLORS[selectedMetric].borderColorHex, borderWidth: 1,
                    },
                  },
                };
                return <ObjBarChart key={`chart-${selectedMetric}-${currentYear}`} data={data} options={options} />;
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="employee-reports__back-row">
        <Button onClick={handleBack} variant='primary' className="employee-reports__back-btn" size='lg'>
          <ArrowLeft size={24} />
          <AtmText as="p" size="md" weight="bold" color="white">Back</AtmText>
        </Button>
      </div>
    </BaseLayout>
  );
}

export default EmployeeReportsPage;
