import { use, useState } from 'react'
import CalendarPage from './pages/CalendarPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AvailabilityPage from './pages/AvailabilityPage.jsx';
import ShiftConfigPage from './pages/ShiftConfigPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GeneratedSchedule from './pages/GeneratedSchedule.jsx';
import {StaffApi} from './services/api.js';
import { employeesMock } from './MockData.js';

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectEditEmployee, setSelectEditEmployee] = useState(null)
  const [startDate, setStartDate] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handLoginSucess = async () => {
    setIsLoading(true);
    try {
      const response = await StaffApi.getAll();
      setEmployees(response.data);
      setCurrentPage(1);

    } catch (error) {
      console.error('Erro ao carregar funcionários');
      setEmployees(employeesMock);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
      console.log('mudando loading', isLoading);
    }
  }

  const pages = [
    <LoginPage
      onPageChange={setCurrentPage}
      onLoginSucess={handLoginSucess}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    />,
    <StaffPage 
      onPageChange={setCurrentPage}
      selectEditEmployee={selectEditEmployee}
      setSelectEditEmployee={setSelectEditEmployee}
      employeesData={employees}
      setEmployeesData={setEmployees}
    />,
    <CalendarPage 
      onPageChange={setCurrentPage}
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
      currentYear={currentYear}
      setCurrentYear={setCurrentYear}
      selectedWeek={selectedWeek}
      setSelectedWeek={setSelectedWeek}
      selectedDays={selectedDays}
      setSelectedDays={setSelectedDays}
      startDate={startDate}
      setStartDate={setStartDate}
    />,
    <ReportsPage onPageChange={setCurrentPage} />,
    <SettingsPage onPageChange={setCurrentPage} />,
    <AvailabilityPage 
      onPageChange={setCurrentPage}
      selectEditEmployee={selectEditEmployee}
      setSelectEditEmployee={setSelectEditEmployee}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    />,
    <ShiftConfigPage 
      onPageChange={setCurrentPage}
      selectedDays={selectedDays}
      startDate={startDate}
    />,
    <GeneratedSchedule 
      onPageChange={setCurrentPage}
      employees={employees}
      setEmployees={setEmployees}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    />
  ];

  return pages[currentPage];
}

export default App;