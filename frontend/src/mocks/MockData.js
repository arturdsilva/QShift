export const DataBaseUser = {
    user_id: 1,
    email: 'guicrfmoriya@gmail.com',
    password: '124'
};

export const employeesMock = [
    { id: 1, name: 'Guilherme Moriya', active: true },
    { id: 2, name: 'Artur Dantas', active: true },
    { id: 3, name: 'Gabriel Padilha', active: false },
    { id: 4, name: 'Arthur Rocha', active: false },
    { id: 5, name: 'Ângelo de Carvalho', active: true }
];

export const employeesAvailability = {
  1: {
    id: 1,
    name: 'Guilherme Moriya',
    availability: [
      { weekday: 0, startTime: '08:00:00', endTime: '17:00:00' },
      { weekday: 1, startTime: '08:00:00', endTime: '20:00:00' },
      { weekday: 2, startTime: '13:00:00', endTime: '21:00:00' },
      { weekday: 3, startTime: '08:00:00', endTime: '19:00:00' },
      { weekday: 4, startTime: '08:00:00', endTime: '23:00:00' },
      { weekday: 5, startTime: '09:00:00', endTime: '18:00:00' }
    ]
  },
  2: {
    id: 2,
    name: 'Artur Dantas',
    availability: [
      { weekday: 0, startTime: '10:00:00', endTime: '21:00:00' },
      { weekday: 1, startTime: '10:00:00', endTime: '22:00:00' },
      { weekday: 2, startTime: '10:00:00', endTime: '19:00:00' },
      { weekday: 4, startTime: '10:00:00', endTime: '24:00:00' },
      { weekday: 5, startTime: '08:00:00', endTime: '21:00:00' }
    ]
  },
  3: {
    id: 3,
    name: 'Gabriel Padilha',
    availability: []
  },
  4: {
    id: 4,
    name: 'Arthur Rocha',
    availability: [
      { weekday: 0, startTime: '14:00:00', endTime: '23:00:00' },
      { weekday: 1, startTime: '14:00:00', endTime: '23:00:00' },
      { weekday: 2, startTime: '14:00:00', endTime: '23:00:00' },
      { weekday: 3, startTime: '14:00:00', endTime: '23:00:00' },
      { weekday: 4, startTime: '14:00:00', endTime: '24:00:00' },
      { weekday: 5, startTime: '10:00:00', endTime: '20:00:00' }
    ]
  },
  5: {
    id: 5,
    name: 'Ângelo de Carvalho',
    availability: [
      { weekday: 0, startTime: '07:00:00', endTime: '22:00:00' },
      { weekday: 1, startTime: '07:00:00', endTime: '22:00:00' },
      { weekday: 2, startTime: '07:00:00', endTime: '22:00:00' },
      { weekday: 3, startTime: '07:00:00', endTime: '22:00:00' },
      { weekday: 4, startTime: '07:00:00', endTime: '23:00:00' },
      { weekday: 5, startTime: '08:00:00', endTime: '22:00:00' }
    ]
  }
};

export const initialSchedule = {
  // Cada dia tem seus próprios horários
  monday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: "669221b3-92d9-473f-aeb5-c1758610b280", name: 'Gabriel'}] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{id: "c844cd19-2813-4344-bfb8-4d77425dd3ca", name: 'Artur'}, {id: "67065c55-ac1e-4d91-8382-5e825c92a9a3", name: 'Guilherme'}] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: "5191a7ba-8777-455b-ab84-1979cdd311dd", name: 'Arthur'}]},
  ],
  tuesday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: "c844cd19-2813-4344-bfb8-4d77425dd3ca", name: 'Artur'}, {id: "669221b3-92d9-473f-aeb5-c1758610b280", name: 'Gabriel'}] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [{id: "67065c55-ac1e-4d91-8382-5e825c92a9a3", name: 'Guilherme'}] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: "5191a7ba-8777-455b-ab84-1979cdd311dd", name: 'Arthur'}, {id: "d950a081-f802-426d-b61a-1a5fd6f3fbd0", name: 'Ângelo'}] },
  ],
  wednesday: [
    { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [] },
    { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
    { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
    { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [] },
  ],
  thursday: [
      { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: "67065c55-ac1e-4d91-8382-5e825c92a9a3", name: 'Guilherme'}, {id: "d950a081-f802-426d-b61a-1a5fd6f3fbd0", name: 'Ângelo'}]},
      { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [] },
      { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [{id: "669221b3-92d9-473f-aeb5-c1758610b280", name: 'Gabriel'}] },
      { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: "5191a7ba-8777-455b-ab84-1979cdd311dd", name: 'Arthur'}, {id: "c844cd19-2813-4344-bfb8-4d77425dd3ca", name: 'Artur'}] },
  ],
  friday: [
      { id: 1, startTime: '08:00', endTime: '11:00', minEmployees: 2, employees: [{id: "5191a7ba-8777-455b-ab84-1979cdd311dd", name: 'Arthur'}] },
      { id: 2, startTime: '08:00', endTime: '12:00', minEmployees: 2, employees: [{id: "67065c55-ac1e-4d91-8382-5e825c92a9a3", name: 'Guilherme'}, {id: "669221b3-92d9-473f-aeb5-c1758610b280", name: 'Gabriel'}] },
      { id: 3, startTime: '13:00', endTime: '18:00', minEmployees: 2, employees: [] },
      { id: 4, startTime: '14:00', endTime: '19:00', minEmployees: 3, employees: [{id: "c844cd19-2813-4344-bfb8-4d77425dd3ca", name: 'Artur'}] },
  ],
  saturday: [
      { id: 101, startTime: '09:00', endTime: '13:00', minEmployees: 3, employees: [{id: "669221b3-92d9-473f-aeb5-c1758610b280", name: 'Gabriel'}, {id: "c844cd19-2813-4344-bfb8-4d77425dd3ca", name: 'Artur'}, {id: 1, name: 'Guilherme'}] },
      { id: 102, startTime: '09:00', endTime: '15:00', minEmployees: 4, employees: [{id: "5191a7ba-8777-455b-ab84-1979cdd311dd", name: 'Arthur'}, {id: "d950a081-f802-426d-b61a-1a5fd6f3fbd0", name: 'Ângelo'}] },
      { id: 103, startTime: '13:00', endTime: '18:00', minEmployees: 4, employees: [] },
      { id: 104, startTime: '14:00', endTime: '20:00', minEmployees: 5, employees: [] },
  ],
  sunday: []
};

export const week = {
  id: 5,
  startDateWeek: new Date(2025, 9, 27),
  selectedDays: [27, 28, 29, 30, 31, 1],
  approved: false
}

export const listAvailability = [
  {weekday: 0, startTime: '10:00:00', endTime: '21:00:00'},
  {weekday: 1, startTime: '10:00:00', endTime: '22:00:00'},
  {weekday: 2, startTime: '10:00:00', endTime: '19:00:00'},
  {weekday: 4, startTime: '10:00:00', endTime: '24:00:00'},
  {weekday: 5, startTime: '08:00:00', endTime: '21:00:00'}
]