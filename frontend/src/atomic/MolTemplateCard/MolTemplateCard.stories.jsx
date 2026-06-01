import { expect, fn, within, userEvent } from 'storybook/test';
import { MolTemplateCard } from './MolTemplateCard.jsx';
import { mockShiftTemplate, mockDayTemplate, mockWeekTemplate } from '../../stories/mocks/templates.js';

export default {
  title: 'Molecules/MolTemplateCard',
  component: MolTemplateCard,
};

export const ShiftTemplate = {
  args: {
    item: mockShiftTemplate,
    type: 'shift',
    onEdit: fn(),
    onDelete: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Morning Shift')).toBeInTheDocument();
    await expect(canvas.getByText('Shift')).toBeInTheDocument();
    await expect(canvas.getByText('08:00 – 12:00')).toBeInTheDocument();
    await expect(canvas.getByText('2 staff required')).toBeInTheDocument();
  },
};

export const DayTemplate = {
  args: {
    item: mockDayTemplate,
    type: 'day',
    onEdit: fn(),
    onDelete: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Weekday Template')).toBeInTheDocument();
    await expect(canvas.getByText('Day')).toBeInTheDocument();
    await expect(canvas.getByText('2 shifts included')).toBeInTheDocument();
  },
};

export const WeekTemplate = {
  args: {
    item: mockWeekTemplate,
    type: 'schedule',
    onEdit: fn(),
    onDelete: fn(),
    onUse: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Standard Week')).toBeInTheDocument();
    await expect(canvas.getByText('Week')).toBeInTheDocument();
    // Click Use button
    const useButton = canvas.getByRole('button', { name: /Use/i });
    await userEvent.click(useButton);
    await expect(args.onUse).toHaveBeenCalledTimes(1);
  },
};

export const EditAction = {
  args: {
    item: mockShiftTemplate,
    type: 'shift',
    onEdit: fn(),
    onDelete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole('button', { name: /Edit/i });
    await userEvent.click(editButton);
    await expect(args.onEdit).toHaveBeenCalledTimes(1);
  },
};

export const DeleteAction = {
  args: {
    item: mockShiftTemplate,
    type: 'shift',
    onEdit: fn(),
    onDelete: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole('button', { name: /Delete/i });
    await userEvent.click(deleteButton);
    await expect(args.onDelete).toHaveBeenCalledTimes(1);
  },
};
