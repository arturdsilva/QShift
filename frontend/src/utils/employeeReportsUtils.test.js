// ─────────────────────────────────────────────────────────────────────────────
// TDD Sprint 5 — US-14
// Nível 1: Testes unitários para funções puras de employeeReportsUtils
//
// FASE RED: estes testes são escritos ANTES da implementação correta.
// Devem FALHAR enquanto a lógica ainda estiver no componente (não em utils).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import {
  formatWorkedHours,
  convertEmployeeStatsFormat,
} from './employeeReportsUtils.js';

// ── formatWorkedHours ────────────────────────────────────────────────────────

describe('formatWorkedHours', () => {
  it('deve formatar inteiro com duas casas decimais', () => {
    expect(formatWorkedHours(8)).toBe('8.00');
  });

  it('deve formatar float com uma casa decimal com duas casas', () => {
    expect(formatWorkedHours(40.5)).toBe('40.50');
  });

  it('deve limitar número com muitas casas decimais a duas', () => {
    // Bug confirmado: sem .toFixed(2) retornaria "8.333333..." sem limite
    expect(formatWorkedHours(8.333333)).toBe('8.33');
  });

  it('deve arredondar corretamente na terceira casa decimal', () => {
    expect(formatWorkedHours(8.336)).toBe('8.34');
  });

  it('deve formatar zero como "0.00"', () => {
    expect(formatWorkedHours(0)).toBe('0.00');
  });

  it('deve formatar número grande corretamente', () => {
    expect(formatWorkedHours(160)).toBe('160.00');
  });
});

// ── convertEmployeeStatsFormat ───────────────────────────────────────────────

describe('convertEmployeeStatsFormat', () => {
  // Dado típico retornado pela API: /employees/{id}/report/{year}
  const apiRawData = {
    name: 'Alice',
    months_data: [
      {
        hours_worked: 160,
        num_days_off: 5,
        num_days_worked: 22,
        num_morning_shifts: 10,
        num_afternoon_shifts: 8,
        num_night_shifts: 4,
      },
      {
        hours_worked: 40.5,
        num_days_off: 2,
        num_days_worked: 18,
        num_morning_shifts: 6,
        num_afternoon_shifts: 7,
        num_night_shifts: 5,
      },
    ],
  };

  it('deve preservar o nome do funcionário', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.name).toBe('Alice');
  });

  it('deve converter months_data para monthsData com 12 entradas (ou o número retornado)', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.monthsData).toHaveLength(2);
  });

  it('deve mapear hours_worked → hoursWorked', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.monthsData[0].hoursWorked).toBe(160);
    expect(result.monthsData[1].hoursWorked).toBe(40.5);
  });

  it('deve mapear num_days_off → daysOff', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.monthsData[0].daysOff).toBe(5);
  });

  it('deve mapear num_days_worked → daysWorked', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.monthsData[0].daysWorked).toBe(22);
  });

  it('deve mapear num_morning_shifts → morningShifts (sem typo "monrning")', () => {
    // Bug existente no código: a chave está com typo "monrningShifts" no componente original.
    // A função utils deve usar a chave correta "morningShifts".
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.monthsData[0].morningShifts).toBe(10);
    expect(result.monthsData[0]).not.toHaveProperty('monrningShifts');
  });

  it('deve mapear num_afternoon_shifts → afternoonShifts', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.monthsData[0].afternoonShifts).toBe(8);
  });

  it('deve mapear num_night_shifts → nightShifts', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result.monthsData[0].nightShifts).toBe(4);
  });

  it('não deve ter a chave months_data no resultado', () => {
    const result = convertEmployeeStatsFormat(apiRawData);
    expect(result).not.toHaveProperty('months_data');
  });
});
