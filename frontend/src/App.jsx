import { use, useState } from 'react'
import CalendarPage from './pages/CalendarPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AvailabilityPage from './pages/AvailabilityPage.jsx';
import ShiftConfigPage from './pages/ShiftConfigPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import GeneratedSchedule from './pages/GeneratedSchedule.jsx';
import ScheduleRecordsPage from './pages/ScheduleRecordsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EmployeeReportsPage from './pages/EmployeeReportsPage.jsx';

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
  const [weekData, setWeekData] = useState(null);
  const [weeksList, setWeeksList] = useState(null); 
  const [weekRecords, setWeekRecords] = useState(null);
  const [currentIdxWeek, setCurrentIdxWeek] = useState(0);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const pages = [
    <LoginPage
      onPageChange={setCurrentPage}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    />,
    <StaffPage 
      onPageChange={setCurrentPage}
      selectEditEmployee={selectEditEmployee}
      setSelectEditEmployee={setSelectEditEmployee}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      employees={employees}
      setEmployees={setEmployees}
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
      isLoading={isLoading}
      setIsLoading={setIsLoading}
    />,
    <ReportsPage 
      onPageChange={setCurrentPage}
      weeksList={weeksList} 
      setWeeksList={setWeeksList}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      setWeekRecords={setWeekRecords}
      currentIdxWeek={currentIdxWeek}
      setCurrentEmployee={setCurrentEmployee}
      employees={employees}
    />,
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
      setWeekData={setWeekData}
    />,
    <GeneratedSchedule 
      onPageChange={setCurrentPage}
      employees={employees}
      setEmployees={setEmployees}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      weekData={weekData}
    />,
    <ScheduleRecordsPage
      onPageChange={setCurrentPage}
      employees={employees}
      setEmployees={setEmployees}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      weeksList={weeksList}
      setWeeksList={setWeeksList}
      weekRecords={weekRecords}
      setWeekRecords={setWeekRecords}
      currentIdxWeek={currentIdxWeek}
      setCurrentIdxWeek={setCurrentIdxWeek}
    />,
    <RegisterPage
      onPageChange={setCurrentPage}
    />,
    <EmployeeReportsPage
      onPageChange={setCurrentPage}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      employeesList={employees}
      currentEmployee={currentEmployee}
      setCurrentEmployee={setCurrentEmployee}
    />
  ];

  return pages[currentPage];
}

export default App;