import { expect, fn, within, userEvent } from 'storybook/test';
import { Button, CalendarDayButton, SelectableButton, LinkButton, AccordionButton } from './Buttons.jsx';

export default {
  title: 'Atoms/AtmButton',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'ghostRed', 'danger', 'logout'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

// ─── Button (primary) ─────────────────────────────────────────

export const Primary = {
  args: {
    children: 'Save',
    variant: 'primary',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save' });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
    onClick: fn(),
  },
};

export const Ghost = {
  args: {
    children: 'Edit',
    variant: 'ghost',
    onClick: fn(),
  },
};

export const Disabled = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled' });
    await expect(button).toBeDisabled();
    await userEvent.click(button).catch(() => {});
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const FullWidth = {
  args: {
    children: 'Full Width Button',
    variant: 'primary',
    fullWidth: true,
    onClick: fn(),
  },
};

// ─── CalendarDayButton ────────────────────────────────────────

export const CalendarDay = {
  render: (args) => <CalendarDayButton {...args} />,
  args: {
    children: '15',
    selected: false,
    currentMonth: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: '15' });
    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const CalendarDaySelected = {
  render: (args) => <CalendarDayButton {...args} />,
  args: {
    children: '20',
    selected: true,
    currentMonth: true,
    onClick: fn(),
  },
};

// ─── SelectableButton ─────────────────────────────────────────

export const Selectable = {
  render: (args) => <SelectableButton {...args} />,
  args: {
    children: 'Employee Name',
    selected: false,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Employee Name' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const SelectableSelected = {
  render: (args) => <SelectableButton {...args} />,
  args: {
    children: 'Selected Employee',
    selected: true,
    onClick: fn(),
  },
};

// ─── LinkButton ───────────────────────────────────────────────

export const Link = {
  render: (args) => <LinkButton {...args} />,
  args: {
    children: 'Click here',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click here' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

// ─── AccordionButton ──────────────────────────────────────────

export const Accordion = {
  render: (args) => <AccordionButton {...args} />,
  args: {
    children: 'Section Title',
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Section Title' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
