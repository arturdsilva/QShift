import BaseLayout from '../layouts/BaseLayout';
import Header from '../components/Header';
import ScheduleTable from '../components/ScheduleTable';
import { useState } from 'react';

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
      1: ['Gabriel'],
      2: ['Artur', 'Guilherme'],
      4: ['Arthur']
    }
  },
  tuesday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {
        2:['Artur','Gabriel'],
        3:['Guilherme'],
        4:['Arthur','Ângelo']
    }
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
    assignments: {
        1: ['Guilherme', 'Ângelo'],
        3: ['Gabriel'],
        4: ['Arthur', 'Artur']
    }
  },
  friday: {
    slots: [
      { id: 1, startTime: '08:00', endTime: '11:00', label: '8h-11h', minEmployees: 2 },
      { id: 2, startTime: '08:00', endTime: '12:00', label: '8h-12h', minEmployees: 2 },
      { id: 3, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 2 },
      { id: 4, startTime: '14:00', endTime: '19:00', label: '14h-19h', minEmployees: 3 },
    ],
    assignments: {
        1: ['Arthur'],
        2: ['Guilherme', 'Gabriel'],
        4: ['Artur']
    }
  },
  saturday: {
    slots: [
      { id: 101, startTime: '09:00', endTime: '13:00', label: '9h-13h', minEmployees: 3 },
      { id: 102, startTime: '09:00', endTime: '15:00', label: '9h-15h', minEmployees: 4 },
      { id: 103, startTime: '13:00', endTime: '18:00', label: '13h-18h', minEmployees: 4 },
      { id: 104, startTime: '14:00', endTime: '20:00', label: '14h-20h', minEmployees: 5 },
    ],
    assignments: {
      101: ['Gabriel', 'Artur', 'Guilherme'],
      102: ['Arthur', 'Ângelo'],
    }
  },
  sunday: {
    slots: [],
    assignments: {}
  }
};

function GeneratedSchedule({onPageChange}) {
    const [scheduleData, setScheduleData] = useState(INITIAL_SCHEDULE);
    return (
        <BaseLayout
            showSidebar={false}
            currentPage={7}
        >
            <Header title="Generated Schedule" />
            <div className="p-6">
                <ScheduleTable
                    scheduleData={scheduleData}
                />
            </div>
        </BaseLayout>
    );
}

export default GeneratedSchedule;