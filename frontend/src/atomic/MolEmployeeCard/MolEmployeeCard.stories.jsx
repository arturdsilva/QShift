import { expect, fn, within, userEvent } from 'storybook/test';
import { MolEmployeeCard } from './MolEmployeeCard.jsx';
import { mockEmployee, mockEmployeeInactive } from '../../stories/mocks/employees.js';

export default {
  title: 'Molecules/MolEmployeeCard',
  component: MolEmployeeCard,
};

export const Active = {
  args: {
    employee: mockEmployee,
    onEdit: fn(),
    onDelete: fn(),
    onToggleActive: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Guilherme Silva')).toBeInTheDocument();
    await expect(canvas.getByText('Scheduled')).toBeInTheDocument();
    // Click edit button (first ghost button with Pencil icon)
    const buttons = canvas.getAllByRole('button');
    // First button is edit (Pencil), second is delete (Trash2)
    await userEvent.click(buttons[0]);
    await expect(args.onEdit).toHaveBeenCalledWith(mockEmployee.id);
  },
};

export const Inactive = {
  args: {
    employee: mockEmployeeInactive,
    onEdit: fn(),
    onDelete: fn(),
    onToggleActive: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Artur Costa')).toBeInTheDocument();
    await expect(canvas.getByText('Unscheduled')).toBeInTheDocument();
  },
};

export const DeleteAction = {
  args: {
    employee: mockEmployee,
    onEdit: fn(),
    onDelete: fn(),
    onToggleActive: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    // Second button is delete (Trash2)
    await userEvent.click(buttons[1]);
    await expect(args.onDelete).toHaveBeenCalledWith(mockEmployee);
  },
};
