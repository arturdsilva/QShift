import { expect, fn, within, userEvent } from 'storybook/test';
import { MolSlotEmployeesPicker } from './MolSlotEmployeePicker.jsx';
import { mockEmployeeList } from '../../stories/mocks/employees.js';

export default {
  title: 'Molecules/MolSlotEmployeePicker',
  component: MolSlotEmployeesPicker,
};

export const Default = {
  args: {
    day: 'Monday',
    slot: { startTime: '08:00', endTime: '12:00', minEmployees: 2 },
    assignedEmployees: [{ id: 1, name: 'Guilherme Silva' }],
    employeeList: mockEmployeeList,
    onToggleEmployee: fn(),
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Should show slot info
    await expect(canvas.getByText('Finish')).toBeInTheDocument();
    // Click Finish button
    const finishButton = canvas.getByRole('button', { name: 'Finish' });
    await userEvent.click(finishButton);
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const NoAssigned = {
  args: {
    day: 'Tuesday',
    slot: { startTime: '13:00', endTime: '18:00', minEmployees: 3 },
    assignedEmployees: [],
    employeeList: mockEmployeeList,
    onToggleEmployee: fn(),
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('(0/3 employees)')).toBeInTheDocument();
  },
};
