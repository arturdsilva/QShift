/**
 * Formata um número de horas para exibição com exatamente 2 casas decimais.
 *
 * Exemplos:
 *   formatWorkedHours(8)      → "8.00"
 *   formatWorkedHours(40.5)   → "40.50"
 *   formatWorkedHours(8.333)  → "8.33"
 *   formatWorkedHours(0)      → "0.00"
 *
 * @param {number} hours - Valor de horas (inteiro ou decimal)
 * @returns {string} Horas formatadas com 2 casas decimais
 */
export function formatWorkedHours(hours) {
  return Number(hours).toFixed(2);
}

/**
 * Converte o formato bruto retornado pela API de estatísticas de funcionário
 * para o formato interno usado pelo frontend.
 *
 * Formato da API:
 *   { name, months_data: [{ hours_worked, num_days_off, num_days_worked,
 *                           num_morning_shifts, num_afternoon_shifts, num_night_shifts }] }
 *
 * Formato interno:
 *   { name, monthsData: [{ hoursWorked, daysOff, daysWorked,
 *                          morningShifts, afternoonShifts, nightShifts }] }
 *
 * @param {object} stats - Dados brutos da API
 * @returns {object} Dados no formato interno do frontend
 */
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
