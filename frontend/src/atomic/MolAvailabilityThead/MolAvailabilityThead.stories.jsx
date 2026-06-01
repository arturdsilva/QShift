import { expect, within } from 'storybook/test';
import { MolAvailabilityThead } from './MolAvailabilityThead.jsx';

export default {
  title: 'Molecules/MolAvailabilityThead',
  component: MolAvailabilityThead,
};

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Select Availability')).toBeInTheDocument();
    await expect(canvas.getByText('Click and drag to mark available times.')).toBeInTheDocument();
    await expect(canvas.getByText('Available')).toBeInTheDocument();
    await expect(canvas.getByText('Unavailable')).toBeInTheDocument();
  },
};
