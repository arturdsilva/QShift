import { expect, within } from 'storybook/test';
import { MolShiftChip } from './MolShiftChip.jsx';

export default {
  title: 'Molecules/MolShiftChip',
  component: MolShiftChip,
};

export const Default = {
  args: {
    shift: {
      name: 'Morning',
      start_time: '08:00',
      end_time: '12:00',
      min_staff: 2,
      color: 'blue',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('MORNING')).toBeInTheDocument();
    await expect(canvas.getByText('08:00 - 12:00')).toBeInTheDocument();
    await expect(canvas.getByText('2 staff')).toBeInTheDocument();
  },
};

export const Small = {
  args: {
    shift: {
      name: 'Night',
      start_time: '22:00',
      end_time: '06:00',
      min_staff: 1,
      color: 'red',
    },
    small: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('NIGHT')).toBeInTheDocument();
  },
};

export const GreenShift = {
  args: {
    shift: {
      name: 'Afternoon',
      start_time: '13:00',
      end_time: '18:00',
      min_staff: 3,
      color: 'green',
    },
  },
};
