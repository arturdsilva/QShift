import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectEditEmployee, setSelectEditEmployee] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [employees, setEmployees] = useState(() => {
    try {
      const savedEmployees = sessionStorage.getItem('employees');
      return savedEmployees ? JSON.parse(savedEmployees) : [];
    } catch (error) {
      console.warn('Error reading employees from sessionStorage:', error);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [weekData, setWeekData] = useState(null);
  const [weeksList, setWeeksList] = useState(null);
  const [weekRecords, setWeekRecords] = useState(null);
  const [currentIdxWeek, setCurrentIdxWeek] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(() => {
    try {
      const savedEmployee = sessionStorage.getItem('currentEmployee');
      return savedEmployee ? JSON.parse(savedEmployee) : null;
    } catch (error) {
      console.warn('Error reading currentEmployee from sessionStorage:', error);
      return null;
    }
  });
  const [shiftsData, setShiftsData] = useState(null);
  const [previewSchedule, setPreviewSchedule] = useState(null);

  useEffect(() => {
    try {
      if (currentEmployee) {
        sessionStorage.setItem('currentEmployee', JSON.stringify(currentEmployee));
      } else {
        sessionStorage.removeItem('currentEmployee');
      }
    } catch (error) {
      console.warn('Error saving currentEmployee to sessionStorage:', error);
    }
  }, [currentEmployee]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage isLoading={isLoading} setIsLoading={setIsLoading} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/staff"
          element={
            <StaffPage
              selectEditEmployee={selectEditEmployee}
              setSelectEditEmployee={setSelectEditEmployee}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              employees={employees}
              setEmployees={setEmployees}
            />
          }
        />
        <Route
          path="/calendar"
          element={
            <CalendarPage
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
              employees={employees}
            />
          }
        />
        <Route
          path="/availability"
          element={
            <AvailabilityPage
              selectEditEmployee={selectEditEmployee}
              setSelectEditEmployee={setSelectEditEmployee}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          }
        />
        <Route
          path="/shift-config"
          element={
            <ShiftConfigPage
              selectedDays={selectedDays}
              startDate={startDate}
              setWeekData={setWeekData}
              setShiftsData={setShiftsData}
              setPreviewSchedule={setPreviewSchedule}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          }
        />
        <Route
          path="/schedule"
          element={
            <GeneratedSchedule
              employees={employees}
              setEmployees={setEmployees}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              weekData={weekData}
              setWeekData={setWeekData}
              shiftsData={shiftsData}
              setShiftsData={setShiftsData}
              previewSchedule={previewSchedule}
              setPreviewSchedule={setPreviewSchedule}
            />
          }
        />
        <Route
          path="/reports"
          element={
            <ReportsPage
              weeksList={weeksList}
              setWeeksList={setWeeksList}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setWeekRecords={setWeekRecords}
              currentIdxWeek={currentIdxWeek}
              setCurrentIdxWeek={setCurrentIdxWeek}
              setCurrentEmployee={setCurrentEmployee}
              employees={employees}
            />
          }
        />
        <Route
          path="/schedule-records"
          element={
            <ScheduleRecordsPage
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
            />
          }
        />
        <Route
          path="/employee-reports"
          element={
            <EmployeeReportsPage
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              employeesList={employees}
              currentEmployee={currentEmployee}
              setCurrentEmployee={setCurrentEmployee}
            />
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
