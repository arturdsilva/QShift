
// Formata um número de horas para exibição com exatamente 2 casas decimais.
export function formatWorkedHours(hours) {
  return Number(hours).toFixed(2);
}


// Converte o formato bruto retornado pela API de estatísticas de funcionário
// para o formato interno usado pelo frontend.
export function convertEmployeeStatsFormat(stats) {
  return {
    name: stats.name,
    monthsData: stats.months_data.map((monthData) => ({
      hoursWorked: monthData.hours_worked,
      daysOff: monthData.num_days_off,
      daysWorked: monthData.num_days_worked,
      morningShifts: monthData.num_morning_shifts,
      afternoonShifts: monthData.num_afternoon_shifts,
      nightShifts: monthData.num_night_shifts,
    })),
  };
}
