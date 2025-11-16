export const COLORS_CHART = {
  textColorAxis: '#94a3b8', // slate-400
  gridColor: 'rgba(148, 163, 184, 0.2)',
  bgChart: 'bg-slate-800'
};

// Color and style settings for employee metrics
export const METRIC_COLORS = {
  daysOff: {
    color: 'blue',
    borderColor: 'border-blue-500',
    borderColorHex: '#3b82f6',
    textColor: 'text-blue-400',
    textColorHex: '#60a5fa',
    bgActive: 'bg-blue-500',
    bgActiveHex: '#3b82f6',
    bgInactive: 'bg-blue-600',
    bgInactiveHex: '#2563eb',
    bgButton: 'bg-blue-600',
    bgButtonHex: '#2563eb'
  },

  daysWorked: {
    color: 'green',
    borderColor: 'border-green-500',
    borderColorHex: '#22c55e',
    textColor: 'text-green-400',
    textColorHex: '#4ade80',
    bgActive: 'bg-green-500',
    bgActiveHex: '#22c55e',
    bgInactive: 'bg-green-600',
    bgInactiveHex: '#16a34a',
    bgButton: 'bg-green-600',
    bgButtonHex: '#16a34a'
  },

  hoursWorked: {
    color: 'purple',
    borderColor: 'border-purple-500',
    borderColorHex: '#a855f7',
    textColor: 'text-purple-400',
    textColorHex: '#c084fc',
    bgActive: 'bg-purple-500',
    bgActiveHex: '#a855f7',
    bgInactive: 'bg-purple-600',
    bgInactiveHex: '#9333ea',
    bgButton: 'bg-purple-600',
    bgButtonHex: '#9333ea'
  },

  monrningShifts: {
    color: 'yellow',
    borderColor: 'border-yellow-500',
    borderColorHex: '#eab308',
    textColor: 'text-yellow-400',
    textColorHex: '#facc15',
    bgActive: 'bg-yellow-500',
    bgActiveHex: '#eab308',
    bgInactive: 'bg-yellow-600',
    bgInactiveHex: '#ca8a04',
    bgButton: 'bg-yellow-600',
    bgButtonHex: '#ca8a04'
  },

  afternoonShifts: {
    color: 'orange',
    borderColor: 'border-orange-500',
    borderColorHex: '#f97316',
    textColor: 'text-orange-400',
    textColorHex: '#fb923c',
    bgActive: 'bg-orange-500',
    bgActiveHex: '#f97316',
    bgInactive: 'bg-orange-600',
    bgInactiveHex: '#ea580c',
    bgButton: 'bg-orange-600',
    bgButtonHex: '#ea580c'
  },

  nightShifts: {
    color: 'red',
    borderColor: 'border-red-500',
    borderColorHex: '#ef4444',
    textColor: 'text-red-400',
    textColorHex: '#f87171',
    bgActive: 'bg-red-500',
    bgActiveHex: '#ef4444',
    bgInactive: 'bg-red-600',
    bgInactiveHex: '#dc2626',
    bgButton: 'bg-red-600',
    bgButtonHex: '#dc2626'
  }
};


// Card configuration (structure, labels)
export const STATS_CONFIG = [
  { key: 'daysOff', label: 'Days Off' },
  { key: 'daysWorked', label: 'Days Worked' },
  { key: 'hoursWorked', label: 'Hours Worked', suffix: 'h' },
  { key: 'monrningShifts', label: 'Morning Shifts' },
  { key: 'afternoonShifts', label: 'Afternoon Shifts' },
  { key: 'nightShifts', label: 'Night Shifts' }
];

// Chart titles
export const METRIC_TITLES = {
  daysWorked: 'Days Worked per Month',
  hoursWorked: 'Hours Worked per Month',
  daysOff: 'Days Off per Month',
  monrningShifts: 'Morning Shifts per Month',
  afternoonShifts: 'Afternoon Shifts per Month',
  nightShifts: 'Night Shifts per Month'
};