import { expect, fn, within, userEvent } from 'storybook/test';
import { MolEmployeeProfile } from './MolEmployeeProfile.jsx';

export default {
  title: 'Molecules/MolEmployeeProfile',
  component: MolEmployeeProfile,
};

export const Default = {
  args: {
    name: 'Guilherme Silva',
    setName: fn(),
    workload: '40',
    setWorkload: fn(),
    isActive: true,
    setIsActive: fn(),
    preferredWeekdays: [0, 1, 2, 3, 4],
    setPreferredWeekdays: fn(),
    error: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Employee name')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Enter the name...')).toBeInTheDocument();
    await expect(canvas.getByText('Weekly Workload (hours)')).toBeInTheDocument();
    await expect(canvas.getByText('Preferred Days')).toBeInTheDocument();
  },
};

export const WithError = {
  args: {
    name: '',
    setName: fn(),
    workload: '',
    setWorkload: fn(),
    isActive: false,
    setIsActive: fn(),
    preferredWeekdays: [],
    setPreferredWeekdays: fn(),
    error: 'Name is required',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Name is required')).toBeInTheDocument();
  },
};

export const InactiveEmployee = {
  args: {
    name: 'Artur Costa',
    setName: fn(),
    workload: '20',
    setWorkload: fn(),
    isActive: false,
    setIsActive: fn(),
    preferredWeekdays: [0, 2, 4],
    setPreferredWeekdays: fn(),
    error: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inactive Employee')).toBeInTheDocument();
  },
};
