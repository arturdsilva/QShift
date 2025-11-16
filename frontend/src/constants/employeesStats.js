// Color and style settings for employee metrics
export const METRIC_COLORS = {
  daysOff: {
    color: 'blue',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    bgActive: 'bg-blue-500',
    bgInactive: 'bg-blue-600',
    bgButton: 'bg-blue-600'
  },
  daysWorked: {
    color: 'green',
    borderColor: 'border-green-500',
    textColor: 'text-green-400',
    bgActive: 'bg-green-500',
    bgInactive: 'bg-green-600',
    bgButton: 'bg-green-600'
  },
  hoursWorked: {
    color: 'purple',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    bgActive: 'bg-purple-500',
    bgInactive: 'bg-purple-600',
    bgButton: 'bg-purple-600'
  },
  morningShifts: {
    color: 'yellow',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    bgActive: 'bg-yellow-500',
    bgInactive: 'bg-yellow-600',
    bgButton: 'bg-yellow-600'
  },
  afternoonShifts: {
    color: 'orange',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-400',
    bgActive: 'bg-orange-500',
    bgInactive: 'bg-orange-600',
    bgButton: 'bg-orange-600'
  }
};

// Card configuration (structure, labels)
export const STATS_CONFIG = [
  { key: 'daysOff', label: 'Days Off' },
  { key: 'daysWorked', label: 'Days Worked' },
  { key: 'hoursWorked', label: 'Hours Worked', suffix: 'h' },
  { key: 'morningShifts', label: 'Morning Shifts' },
  { key: 'afternoonShifts', label: 'Afternoon Shifts' }
];

// Chart titles
export const METRIC_TITLES = {
  daysWorked: 'Days Worked per Month',
  hoursWorked: 'Hours Worked per Month',
  daysOff: 'Days Off per Month',
  morningShifts: 'Morning Shifts per Month',
  afternoonShifts: 'Afternoon Shifts per Month'
};