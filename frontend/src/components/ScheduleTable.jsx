// DADOS MOCKADOS
const INITIAL_SCHEDULE = {
  // Cada dia tem seus próprios horários
  monday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {
      1: ['Lu'],
      2: ['Ana', 'João'],
      4: ['Maria']
    }
  },
  tuesday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  wednesday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  thursday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  friday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {}
  },
  saturday: {
    slots: [
      { id: 101, startTime: '09:00', endTime: '13:00', label: '9h-13h', minEmployees: 3 },
      { id: 102, startTime: '09:00', endTime: '15:00', label: '9h-15h', minEmployees: 4 },
      { id: 103, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 4 },
      { id: 104, startTime: '14:00', endTime: '20:00', label: '14h-20h', minEmployees: 5 },
    ],
    assignments: {
      101: ['Lu', 'Ana', 'João'],
      102: ['Maria', 'Pedro', 'Carlos', 'Beatriz'],
    }
  },
  sunday: {
    slots: [],
    assignments: {}
  }
};




function ScheduleTable({

}) {

    return 
}