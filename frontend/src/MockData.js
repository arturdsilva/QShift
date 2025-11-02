export const DataBaseUser = {
    user_id: 1,
    username: 'gui',
    password: '123'
};

export const employeesMock = [
    { id: 1, name: 'Guilherme Moriya', active: true },
    { id: 2, name: 'Artur Dantas', active: true },
    { id: 3, name: 'Gabriel Padilha', active: false },
    { id: 4, name: 'Arthur Rocha', active: false },
    { id: 5, name: 'Ângelo de Carvalho', active: true }
];

export const employeesAvaibility = {
  1: {
    id: 1,
    name: 'Guilherme Moriya',
    active: true,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  2: {
    id: 2,
    name: 'Artur Dantas',
    active: true,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': false, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': true
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  3: {
    id: 3,
    name: 'Gabriel Padilha',
    active: false,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  4: {
    id: 4,
    name: 'Arthur Rocha',
    active: false,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': true
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': false, '11:00': false, '12:00': false, '13:00': false, '14:00': false,
        '15:00': false, '16:00': false, '17:00': false, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  },
  5: {
    id: 5,
    name: 'Ângelo de Carvalho',
    active: true,
    availability: {
      'Monday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Tuesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Wednesday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Thursday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Friday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': true, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': true, '23:00': false
      },
      'Saturday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': true, '09:00': true,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': true, '19:00': true,
        '20:00': true, '21:00': true, '22:00': false, '23:00': false
      },
      'Sunday': {
        '00:00': false, '01:00': false, '02:00': false, '03:00': false, '04:00': false,
        '05:00': false, '06:00': false, '07:00': false, '08:00': false, '09:00': false,
        '10:00': true, '11:00': true, '12:00': true, '13:00': true, '14:00': true,
        '15:00': true, '16:00': true, '17:00': true, '18:00': false, '19:00': false,
        '20:00': false, '21:00': false, '22:00': false, '23:00': false
      }
    }
  }
};

export const initialSchedule = {
  // Cada dia tem seus próprios horários
  monday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 3, name: 'Gabriel'}] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{id: 2, name: 'Artur'}, {id: 1, name: 'Guilherme'}] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 4, name: 'Arthur'}]},
  ],
  tuesday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 2, name: 'Artur'}, {id: 3, name: 'Gabriel'}] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [{id: 1, name: 'Guilherme'}] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 4, name: 'Arthur'}, {id: 5, name: 'Ângelo'}] },
  ],
  wednesday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [] },
  ],
  thursday: [
      { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 1, name: 'Guilherme'}, {id: 5, name: 'Ângelo'}]},
      { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
      { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [{id: 3, name: 'Gabriel'}] },
      { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 4, name: 'Arthur'}, {id: 2, name: 'Artur'}] },
  ],
  friday: [
      { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: 4, name: 'Arthur'}] },
      { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{id: 1, name: 'Guilherme'}, {id: 3, name: 'Gabriel'}] },
      { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
      { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: 2, name: 'Artur'}] },
  ],
  saturday: [
      { id: 101, startTime: '09:00', endTime: '13:00', minEmployees: 3, employees: [{id: 3, name: 'Gabriel'}, {id: 2, name: 'Artur'}, {id: 1, name: 'Guilherme'}] },
      { id: 102, startTime: '09:00', endTime: '15:00', minEmployees: 4, employees: [{id: 4, name: 'Arthur'}, {id: 5, name: 'Ângelo'}] },
      { id: 103, startTime: '13:00', endTime: '18:00', minEmployees: 4, employees: [] },
      { id: 104, startTime: '14:00', endTime: '20:00', minEmployees: 5, employees: [] },
  ],
  sunday: []
};
export const initialScheduleEmpty = {
  monday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  tuesday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  wednesday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  thursday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  friday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  saturday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
  sunday: [{ id: null, startTime: '', endTime: '', minEmployees: null, employees: [] }],
};

export const week = {
  id: 5,
  startDateWeek: new Date(2025, 9, 27),
  selectedDays: [27, 28, 29, 30, 31, 1],
  approved: false
}