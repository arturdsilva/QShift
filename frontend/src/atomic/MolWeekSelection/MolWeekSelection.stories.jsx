import { expect, within } from 'storybook/test';
import { MolWeekSelection } from './MolWeekSelection.jsx';

export default {
  title: 'Molecules/MolWeekSelection',
  component: MolWeekSelection,
};

export const WithSelection = {
  args: {
    startDate: new Date(2025, 9, 27),
    selectedDays: [
      new Date(2025, 9, 27),
      new Date(2025, 9, 28),
      new Date(2025, 9, 29),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Week Selection')).toBeInTheDocument();
    await expect(canvas.getByText('Week of')).toBeInTheDocument();
    await expect(canvas.getByText('Until')).toBeInTheDocument();
  },
};

export const NoSelection = {
  args: {
    startDate: null,
    selectedDays: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No selection')).toBeInTheDocument();
  },
};
