import ExcelJS from 'exceljs';

/**
 * Retorna o nome do mês em português
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
 * Formata a data para o cabeçalho
 */
function formatDateHeader(date) {
  const day = date.getDate();
  const monthNames = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  const month = monthNames[date.getMonth()];
  return `${day} ${month}.`;
}

/**
 * Verifica se dois arrays de slots são iguais
 */
function areEqualSlots(slots1, slots2) {
  if (slots1.length !== slots2.length) return false;

  return slots1.every((slot1, index) => {
    const slot2 = slots2[index];
    return slot1.startTime === slot2.startTime && slot1.endTime === slot2.endTime;
  });
}

export async function exportToExcel(scheduleData, week, employeeList) {
  const days_of_week = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const dayHeaders = {
    monday: 'seg.',
    tuesday: 'ter.',
    wednesday: 'qua.',
    thursday: 'qui.',
    friday: 'sex.',
    saturday: 'sáb.',
    sunday: 'dom.',
  };

  if (!week || !week.start_date) return;
  const [yearStartDate, monthStartDate, dayStartDate] = week.start_date.split('-').map(Number);
  const startDate = new Date(yearStartDate, monthStartDate - 1, dayStartDate);
  const monthName = getMonthName(startDate.getMonth());

  // Calcular quais dias mostram coluna de horários (visibleSlots)
  const visibleSlots = {};
  let previousSlots = [];
  days_of_week.forEach((day) => {
    const currentSlots = scheduleData[day];
    visibleSlots[day] = !areEqualSlots(currentSlots, previousSlots);
    previousSlots = currentSlots;
  });

  // Criar workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Escala');

  // Calcular largura dinâmica das colunas
  const columns = [];
  days_of_week.forEach((day) => {
    if (visibleSlots[day]) {
      columns.push({ width: 15 }); // Coluna de horários
    }
    columns.push({ width: 20 }); // Coluna do dia
  });
  worksheet.columns = columns;

  // Calcular número total de colunas
  const totalColumns = days_of_week.reduce((acc, day) => acc + (visibleSlots[day] ? 2 : 1), 0);
  const lastColumnLetter = String.fromCharCode(64 + totalColumns); // A=65, então 64+1=A

  // Linha 1: Mês (mesclada em todas as colunas)
  worksheet.mergeCells(`A1:${lastColumnLetter}1`);
  const monthCell = worksheet.getCell('A1');
  monthCell.value = monthName;
  monthCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF28C28' },
  };
  monthCell.font = {
    bold: true,
    color: { argb: 'FFFFFFFF' },
    size: 14,
  };
  monthCell.alignment = { vertical: 'middle', horizontal: 'center' };
  monthCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  // Linha 2: Cabeçalho dos dias
  const dayRowValues = [];
  days_of_week.forEach((day) => {
    if (visibleSlots[day]) {
      dayRowValues.push(''); // Coluna de horários vazia
    }
    dayRowValues.push(dayHeaders[day]);
  });

  const dayRow = worksheet.getRow(2);
  dayRow.values = dayRowValues;
  let colIndex = 1;
  days_of_week.forEach((day) => {
    if (visibleSlots[day]) {
      const timeSlotCell = dayRow.getCell(colIndex);
      timeSlotCell.alignment = { vertical: 'middle', horizontal: 'center' };
      timeSlotCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      colIndex++;
    }

    const dayCell = dayRow.getCell(colIndex);
    dayCell.alignment = { vertical: 'middle', horizontal: 'center' };
    dayCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    dayCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8D57E' },
    };
    colIndex++;
  });

  // Linha 3: Datas
  const dateRowValues = [];
  for (let i = 0; i < 7; i++) {
    const day = days_of_week[i];
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    if (visibleSlots[day]) {
      dateRowValues.push(''); // Coluna de horários vazia
    }
    dateRowValues.push(formatDateHeader(currentDate));
  }

  const dateRow = worksheet.getRow(3);
  dateRow.values = dateRowValues;
  colIndex = 1;
  days_of_week.forEach((day) => {
    if (visibleSlots[day]) {
      const timeSlotCell = dateRow.getCell(colIndex);
      timeSlotCell.alignment = { vertical: 'middle', horizontal: 'center' };
      timeSlotCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      colIndex++;
    }

    const dateCell = dateRow.getCell(colIndex);
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };
    dateCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    dateCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF6E8C3' },
    };
    colIndex++;
  });

  // Encontrar número máximo de slots
  const maxSlots = Math.max(...days_of_week.map((day) => scheduleData[day].length), 1);

  // Linhas de turnos
  let currentRow = 4;
  const lightBorder = { style: 'thin', color: { argb: 'FFD3D3D3' } };
  const darkBorder = { style: 'thin' };

  for (let slotIndex = 0; slotIndex < maxSlots; slotIndex++) {
    const rowValues = [];

    days_of_week.forEach((day) => {
      const daySlots = scheduleData[day] || [];
      const slot = daySlots[slotIndex];

      // Adicionar coluna de horários se visível
      if (visibleSlots[day]) {
        if (slot) {
          rowValues.push(`${slot.startTime} - ${slot.endTime}`);
        } else {
          rowValues.push('');
        }
      }

      // Adicionar coluna de funcionários
      if (slot) {
        const names = slot.employees.map((e) => e.name);
        let namesStr = '';
        if (names.length === 1) {
          namesStr = names[0];
        } else if (names.length === 2) {
          namesStr = names.join(' e ');
        } else if (names.length > 2) {
          const last = names.pop();
          namesStr = names.join(', ') + ' e ' + last;
        }
        rowValues.push(namesStr);
      } else {
        rowValues.push('');
      }
    });

    const row = worksheet.getRow(currentRow);
    row.values = rowValues;

    colIndex = 1;
    days_of_week.forEach((day) => {
      const daySlots = scheduleData[day] || [];
      const slot = daySlots[slotIndex];

      // Estilizar coluna de horários se visível
      if (visibleSlots[day]) {
        const timeCell = row.getCell(colIndex);
        timeCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        if (slotIndex === 0) {
          timeCell.border = {
            top: darkBorder,
            left: darkBorder,
            bottom: lightBorder,
            right: darkBorder,
          };
        } else if (slotIndex === maxSlots - 1) {
          timeCell.border = {
            top: lightBorder,
            left: darkBorder,
            bottom: darkBorder,
            right: darkBorder,
          };
        } else {
          timeCell.border = {
            top: lightBorder,
            left: darkBorder,
            bottom: lightBorder,
            right: darkBorder,
          };
        }

        timeCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF6E8C3' },
        };
        colIndex++;
      }

      // Estilizar coluna de funcionários
      const empCell = row.getCell(colIndex);
      empCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

      if (slotIndex === 0) {
        empCell.border = {
          top: darkBorder,
          left: darkBorder,
          bottom: lightBorder,
          right: darkBorder,
        };
      } else if (slotIndex === maxSlots - 1) {
        empCell.border = {
          top: lightBorder,
          left: darkBorder,
          bottom: darkBorder,
          right: darkBorder,
        };
      } else {
        empCell.border = {
          top: lightBorder,
          left: darkBorder,
          bottom: lightBorder,
          right: darkBorder,
        };
      }

      // Cinza claro nas células vazias
      if (!slot || !empCell.value || empCell.value === '') {
        empCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC0C0C0' },
        };
      }

      colIndex++;
    });

    currentRow++;
  }

  // Linha de folgas
  const folgasRowValues = [];
  days_of_week.forEach((day) => {
    if (visibleSlots[day]) {
      folgasRowValues.push(day === 'monday' ? 'FOLGAS' : '');
    }

    const dayShifts = scheduleData[day] || [];
    const assignedIds = new Set();
    dayShifts.forEach((shift) => {
      shift.employees.forEach((emp) => assignedIds.add(emp.id));
    });

    const employeesOff = employeeList.filter((emp) => !assignedIds.has(emp.id) && emp.active);
    folgasRowValues.push(employeesOff.length > 0 ? employeesOff.map((e) => e.name).join(' ') : '');
  });

  const folgasRow = worksheet.getRow(currentRow);
  folgasRow.values = folgasRowValues;

  colIndex = 1;
  days_of_week.forEach((day) => {
    if (visibleSlots[day]) {
      const timeCell = folgasRow.getCell(colIndex);
      timeCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      timeCell.border = {
        top: { style: 'thin' },
        left: { style: 'none' },
        bottom: { style: 'none' },
        right: { style: 'none' },
      };
      timeCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5E2CC' },
      };
      if (day === 'monday') {
        timeCell.font = { bold: true };
      }
      colIndex++;
    }

    const empCell = folgasRow.getCell(colIndex);
    empCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    empCell.border = {
      top: { style: 'thin' },
      left: { style: 'none' },
      bottom: { style: 'none' },
      right: { style: 'none' },
    };
    empCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5E2CC' },
    };
    colIndex++;
  });

  // Gerar arquivo e download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `escala_${week.start_date}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
