export const mockShift = {
  id: 1,
  name: 'Morning',
  start_time: '08:00',
  end_time: '12:00',
  min_staff: 2,
  color: 'blue',
};

export const mockShiftGreen = {
  id: 2,
  name: 'Afternoon',
  start_time: '13:00',
  end_time: '18:00',
  min_staff: 3,
  color: 'green',
};

export const mockSlot = {
  id: 1,
  startTime: '08:00',
  endTime: '12:00',
  minEmployees: 2,
  employees: [
    { id: 1, name: 'Guilherme Silva' },
  ],
};

export const mockSlotEmpty = {
  id: 2,
  startTime: '13:00',
  endTime: '18:00',
  minEmployees: 3,
  employees: [],
};

export const mockScheduleData = {
  Monday: [
    { id: 1, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{ id: 1, name: 'Guilherme' }] },
    { id: 2, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
  ],
  Tuesday: [
    { id: 3, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{ id: 2, name: 'Artur' }] },
    { id: 4, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [{ id: 3, name: 'Gabriel' }] },
  ],
  Wednesday: [
    { id: 5, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
    { id: 6, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
  ],
  Thursday: [
    { id: 7, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{ id: 4, name: 'Arthur' }] },
    { id: 8, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
  ],
  Friday: [
    { id: 9, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{ id: 5, name: 'Ângelo' }] },
    { id: 10, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
  ],
  Saturday: [
    { id: 11, startTime: '09:00', endTime: '13:00', minEmployees: 3, employees: [] },
    { id: 12, startTime: '14:00', endTime: '20:00', minEmployees: 2, employees: [] },
  ],
  Sunday: [],
};

export const mockVisibleSlots = {
  Monday: true,
  Tuesday: true,
  Wednesday: true,
  Thursday: true,
  Friday: true,
  Saturday: true,
  Sunday: false,
};

export const mockSelectedDaysMap = {
  Monday: '27',
  Tuesday: '28',
  Wednesday: '29',
  Thursday: '30',
  Friday: '31',
  Saturday: '1',
  Sunday: '',
};
