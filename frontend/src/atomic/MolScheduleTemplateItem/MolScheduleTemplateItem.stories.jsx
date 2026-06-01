import { expect, fn, within, userEvent } from 'storybook/test';
import { TemplateItem } from './MolTemplateItem.jsx';

export default {
  title: 'Molecules/MolScheduleTemplateItem',
  component: TemplateItem,
};

export const Default = {
  args: {
    item: { id: 1, name: 'Morning Shift', _type: 'shift' },
    meta: '08:00 – 12:00 · 2 staff',
    onDelete: fn(),
    color: 'blue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Morning Shift')).toBeInTheDocument();
    await expect(canvas.getByText('08:00 – 12:00 · 2 staff')).toBeInTheDocument();
  },
};

export const DeleteAction = {
  args: {
    item: { id: 2, name: 'Night Shift', _type: 'shift' },
    meta: '22:00 – 06:00 · 1 staff',
    onDelete: fn(),
    color: 'red',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Click the delete button
    const deleteButton = canvas.getByRole('button');
    await userEvent.click(deleteButton);
    await expect(args.onDelete).toHaveBeenCalledWith(2);
  },
};

export const LongName = {
  args: {
    item: { id: 3, name: 'Very Long Shift Name That Gets Truncated', _type: 'shift' },
    meta: '08:00 – 18:00 · 5 staff required minimum',
    onDelete: fn(),
    color: 'green',
  },
};
