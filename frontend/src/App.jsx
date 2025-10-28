import { useState } from 'react'
import CalendarPage from './pages/CalendarPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AvailabilityPage from './pages/AvailabilityPage.jsx';
import ShiftConfigPage from './pages/ShiftConfigPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectEditEmployee, setSelectEditEmployee] = useState(null)
  const [user, setUser] = useState(null);


  const pages = [
    <LoginPage
      onPageChange={setCurrentPage}
    />,
    <StaffPage 
      onPageChange={setCurrentPage}
      selectEditEmployee={selectEditEmployee}
      setSelectEditEmployee={setSelectEditEmployee}
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
    />,
    <ReportsPage onPageChange={setCurrentPage} />,
    <SettingsPage onPageChange={setCurrentPage} />,
    <AvailabilityPage 
      onPageChange={setCurrentPage}
      selectEditEmployee={selectEditEmployee}
      setSelectEditEmplyee={setSelectEditEmployee}
    />,
    <ShiftConfigPage 
      onPageChange={setCurrentPage}
      selectedDays={selectedDays}
    />
  ];

  return pages[currentPage];
}

export default App;