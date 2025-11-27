/**
 * Utilitário para exportar escalas em formato CSV
 */

/**
 * Retorna o nome do mês em português
 * @param {number} monthIndex - Índice do mês (0-11)
 * @returns {string} Nome do mês
 */
function getMonthName(monthIndex) {
  const months = [
    'JANEIRO',
    'FEVEREIRO',
    'MARÇO',
    'ABRIL',
    'MAIO',
    'JUNHO',
    'JULHO',
    'AGOSTO',
    'SETEMBRO',
    'OUTUBRO',
    'NOVEMBRO',
    'DEZEMBRO',
  ];
  return months[monthIndex] || '';
}

/**
 * Formata a data para o cabeçalho (ex: "7 jul.")
 * @param {Date} date - Data
 * @returns {string} Data formatada
 */
function formatDateHeader(date) {
  const day = date.getDate();
  const month = getMonthName(date.getMonth()).toLowerCase().substring(0, 3);
  return `${day} ${month}.`;
}

/**
 * Calcula estatísticas da escala
 * @param {Object} scheduleData - Dados da escala
 * @param {Array} employeeList - Lista de funcionários
 * @returns {Object} Estatísticas
 */
export function getSummaryStatistics(scheduleData, employeeList) {
  const days_of_week = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

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

  return {
    totalShifts,
    totalAssignments,
    understaffedShifts,
    activeEmployees: employeeList.filter((emp) => emp.active).length,
  };
}

/**
 * Exporta escala para CSV
 * @param {Object} scheduleData - Dados da escala (formato do frontend)
 * @param {Object} week - Dados da semana
 * @param {Array} employeeList - Lista de funcionários
 */
export function exportToCSV(scheduleData, week, employeeList) {
  const days_of_week = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  // Mapeamento para cabeçalhos em português
  const dayHeaders = {
    monday: 'seg.',
    tuesday: 'ter.',
    wednesday: 'qua.',
    thursday: 'qui.',
    friday: 'sex.',
    saturday: 'sáb.',
    sunday: 'dom.',
  };

  // 1. Preparar dados das datas
  if (!week || !week.start_date) return;
  const [yearStartDate, monthStartDate, dayStartDate] = week.start_date.split('-').map(Number);
  const startDate = new Date(yearStartDate, monthStartDate - 1, dayStartDate);

  // Nome do Mês (baseado na data de início da semana)
  const monthName = getMonthName(startDate.getMonth());

  // 2. Coletar todos os horários únicos de turno
  const uniqueTimes = new Set();
  days_of_week.forEach(day => {
    if (scheduleData[day]) {
      scheduleData[day].forEach(shift => {
        uniqueTimes.add(`${shift.startTime} - ${shift.endTime}`);
      });
    }
  });

  // Ordenar horários
  const sortedTimes = Array.from(uniqueTimes).sort((a, b) => {
    const timeA = a.split(' - ')[0];
    const timeB = b.split(' - ')[0];
    return timeA.localeCompare(timeB, undefined, { numeric: true });
  });

  // Início da construção do CSV
  let csv = '';

  // Linha 1: Mês
  csv += `${monthName}\n`;

  // Linha 2: Dias da semana (cabeçalho)
  // Primeira coluna vazia (para os horários), depois os dias
  csv += ',' + days_of_week.map(day => dayHeaders[day]).join(',') + '\n';

  // Linha 3: Datas
  const dateRow = ['']; // Primeira coluna vazia
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    dateRow.push(formatDateHeader(currentDate));
  }
  csv += dateRow.join(',') + '\n';

  // Linhas de Turnos
  sortedTimes.forEach(timeRange => {
    const row = [timeRange]; // Primeira coluna: Horário

    days_of_week.forEach(day => {
      const dayShifts = scheduleData[day] || [];
      // Encontrar turno que corresponde a este horário neste dia
      const shift = dayShifts.find(s => `${s.startTime} - ${s.endTime}` === timeRange);

      if (shift) {
        // Formatar nomes dos funcionários
        const names = shift.employees.map(e => e.name);
        let namesStr = '';
        if (names.length === 1) {
          namesStr = names[0];
        } else if (names.length > 1) {
          // Juntar com " e " para o último, vírgula para os outros se necessário
          if (names.length === 2) {
            namesStr = names.join(' e ');
          } else {
            const last = names.pop();
            namesStr = names.join(', ') + ' e ' + last;
          }
        }
        row.push(`"${namesStr}"`);
      } else {
        row.push('');
      }
    });

    csv += row.join(',') + '\n';
  });

  // Linha de Folgas
  csv += 'FOLGAS,';
  const folgasRow = [];

  days_of_week.forEach(day => {
    const dayShifts = scheduleData[day] || [];
    const assignedIds = new Set();
    dayShifts.forEach(shift => {
      shift.employees.forEach(emp => assignedIds.add(emp.id));
    });

    const employeesOff = employeeList.filter(emp => !assignedIds.has(emp.id) && emp.active);

    if (employeesOff.length > 0) {
      const names = employeesOff.map(e => e.name).join(' ');
      folgasRow.push(`"${names}"`);
    } else {
      folgasRow.push('');
    }
  });
  csv += folgasRow.join(',') + '\n';

  // Estatísticas
  csv += '\n\nSummary Statistics\n';
  csv += 'Metric,Value\n';

  const stats = getSummaryStatistics(scheduleData, employeeList);

  csv += `Total Shifts,${stats.totalShifts}\n`;
  csv += `Total Assignments,${stats.totalAssignments}\n`;
  csv += `Understaffed Shifts,${stats.understaffedShifts}\n`;
  csv += `Active Employees,${stats.activeEmployees}\n`;

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `escala_${week.start_date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
