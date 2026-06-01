import { expect, within } from 'storybook/test';
import { MolDaysSelection } from './MolDaysSelection.jsx';

const mockSelectedDays = [
  new Date(2025, 9, 27),
  new Date(2025, 9, 28),
  new Date(2025, 9, 29),
  new Date(2025, 9, 30),
  new Date(2025, 9, 31),
];

export default {
  title: 'Molecules/MolDaysSelection',
  component: MolDaysSelection,
};

export const WithDays = {
  args: {
    selectedDays: mockSelectedDays,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Selected Days')).toBeInTheDocument();
    // Should render day numbers as chips
    await expect(canvas.getByText('27')).toBeInTheDocument();
    await expect(canvas.getByText('31')).toBeInTheDocument();
  },
};

export const NoDays = {
  args: {
    selectedDays: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No days selected')).toBeInTheDocument();
  },
};
