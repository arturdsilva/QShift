import { expect, fn, within } from 'storybook/test';
import { MolAvailabilityTable } from './MolAvailabilityTable.jsx';
import { daysOfWeek } from '../../constants/constantsOfTable.js';

const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// Build a full availability map: { Monday: { '08:00': true, ... }, ... }
const availability = {};
daysOfWeek.forEach((day) => {
  availability[day] = {};
  hours.forEach((hour) => {
    availability[day][hour] = Math.random() > 0.5;
  });
});

export default {
  title: 'Molecules/MolAvailabilityTable',
  component: MolAvailabilityTable,
};

export const Default = {
  args: {
    hours,
    availability,
    onMouseDown: fn(),
    onMouseEnter: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should render day labels
    await expect(canvas.getByText('Monday')).toBeInTheDocument();
    await expect(canvas.getByText('Friday')).toBeInTheDocument();
  },
};
