export const mockShiftTemplate = {
  id: 'shift-1',
  name: 'Morning Shift',
  start: '08:00',
  end: '12:00',
  staff: 2,
  color: 'blue',
};

export const mockDayTemplate = {
  id: 'day-1',
  name: 'Weekday Template',
  color: 'green',
  shifts: [
    { id: 's1', name: 'Morning', start: '08:00', end: '12:00', staff: 2, color: 'blue' },
    { id: 's2', name: 'Afternoon', start: '13:00', end: '18:00', staff: 3, color: 'green' },
  ],
};

export const mockWeekTemplate = {
  id: 'week-1',
  name: 'Standard Week',
  color: 'purple',
  days: [
    {
      day: 'Monday',
      shifts: [
        { id: 's1', name: 'Morning', start: '08:00', end: '12:00', staff: 2, color: 'blue' },
        { id: 's2', name: 'Afternoon', start: '13:00', end: '18:00', staff: 3, color: 'green' },
      ],
    },
    {
      day: 'Tuesday',
      shifts: [
        { id: 's3', name: 'Morning', start: '08:00', end: '12:00', staff: 2, color: 'blue' },
      ],
    },
    { day: 'Wednesday', shifts: [] },
    { day: 'Thursday', shifts: [] },
    {
      day: 'Friday',
      shifts: [
        { id: 's4', name: 'Night', start: '18:00', end: '23:00', staff: 2, color: 'red' },
      ],
    },
    { day: 'Saturday', shifts: [] },
    { day: 'Sunday', shifts: [] },
  ],
};
