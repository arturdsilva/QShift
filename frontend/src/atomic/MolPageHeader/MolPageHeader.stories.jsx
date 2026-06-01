import { expect, fn, within, userEvent } from 'storybook/test';
import { MolPageHeader } from './MolPageHeader.jsx';
import { CalendarRange } from 'lucide-react';
import { Button } from '../AtmButton/index.js';

export default {
  title: 'Molecules/MolPageHeader',
  component: MolPageHeader,
};

export const Default = {
  args: {
    title: 'Create Schedule',
    icon: CalendarRange,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Create Schedule')).toBeInTheDocument();
  },
};

export const WithChildren = {
  args: {
    title: 'Employees',
    icon: CalendarRange,
  },
  render: (args) => (
    <MolPageHeader {...args}>
      <Button variant="primary" onClick={fn()}>Add Employee</Button>
    </MolPageHeader>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Employees')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Add Employee' })).toBeInTheDocument();
  },
};

export const WithoutIcon = {
  args: {
    title: 'Reports',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Reports')).toBeInTheDocument();
  },
};
