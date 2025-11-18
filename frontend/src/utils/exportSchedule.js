/**
 * Utilitário para exportar escalas em formato CSV
 */

/**
 * Formata o período da semana para exibição
 * @param {Object} week - Dados da semana
 * @returns {string} Período formatado
 */
function formatWeekPeriod(week) {
  if (!week || !week.start_date) return '';
  
  const [yearStartDate, monthStartDate, dayStartDate] = week.start_date.split('-').map(Number);
  const startDate = new Date(yearStartDate, monthStartDate - 1, dayStartDate);
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const startMonth = months[startDate.getMonth()];
  const endMonth = months[endDate.getMonth()];
  
  if (startMonth === endMonth) {
    return `${startDate.getDate()}-${endDate.getDate()} ${startMonth} ${startDate.getFullYear()}`;
  }
  
  return `${startDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth} ${startDate.getFullYear()}`;
}

/**
 * Exporta escala para CSV
 * @param {Object} scheduleData - Dados da escala (formato do frontend)
 * @param {Object} week - Dados da semana
 * @param {Array} employeeList - Lista de funcionários
 */
export function exportToCSV(scheduleData, week, employeeList) {
  const days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  let csv = 'QShift - Work Schedule\n';
  csv += `Week: ${formatWeekPeriod(week)}\n\n`;
  
  csv += 'Day,Shift Time,Required Staff,Assigned Staff,Status,Employees\n';
  
  days_of_week.forEach((day, dayIndex) => {
    const dayData = scheduleData[day];
    if (dayData && dayData.length > 0) {
      dayData.forEach((shift) => {
        const dayName = dayNames[dayIndex];
        const shiftTime = `${shift.startTime}-${shift.endTime}`;
        const requiredStaff = shift.minEmployees;
        const assignedStaff = shift.employees.length;
        const status = assignedStaff < requiredStaff ? 'Understaffed' : 'OK';
        const employeeNames = shift.employees.map(emp => emp.name).join('; ');
        
        csv += `${dayName},${shiftTime},${requiredStaff},${assignedStaff},${status},"${employeeNames}"\n`;
      });
    }
  });
  
  csv += '\n\nEmployees on Day Off by Day\n';
  csv += 'Day,Employees\n';
  
  days_of_week.forEach((day, dayIndex) => {
    const assignedEmployees = [];
    scheduleData[day].forEach(slot => {
      slot.employees.forEach(emp => {
        if (!assignedEmployees.find(e => e.id === emp.id)) {
          assignedEmployees.push(emp);
        }
      });
    });
    
    const onBreak = employeeList.filter(emp => 
      !assignedEmployees.find(assigned => assigned.id === emp.id)
    );
    
    const dayName = dayNames[dayIndex];
    const employeeNames = onBreak.map(emp => emp.name).join('; ');
    csv += `${dayName},"${employeeNames || 'None'}"\n`;
  });
  
  csv += '\n\nSummary Statistics\n';
  csv += 'Metric,Value\n';
  
  let totalShifts = 0;
  let totalAssignments = 0;
  let understaffedShifts = 0;
  
  days_of_week.forEach((day) => {
    const dayData = scheduleData[day];
    if (dayData && dayData.length > 0) {
      dayData.forEach((shift) => {
        totalShifts++;
        totalAssignments += shift.employees.length;
        if (shift.employees.length < shift.minEmployees) {
          understaffedShifts++;
        }
      });
    }
  });
  
  csv += `Total Shifts,${totalShifts}\n`;
  csv += `Total Assignments,${totalAssignments}\n`;
  csv += `Understaffed Shifts,${understaffedShifts}\n`;
  csv += `Active Employees,${employeeList.filter(emp => emp.active).length}\n`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `schedule_${week.start_date}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

