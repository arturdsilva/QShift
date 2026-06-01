import { expect, fn, within, userEvent } from 'storybook/test';
import { AtmCheckbox } from './Checkbox.jsx';

export default {
  title: 'Atoms/AtmCheckbox',
  component: AtmCheckbox,
  argTypes: {
    checked: { control: 'boolean' },
  },
};

export const Checked = {
  args: {
    checked: false,
    onChange: fn(),
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Active')).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox')).toBeChecked();
  },
};

export const Unchecked = {
  args: {
    checked: false,
    onChange: fn(),
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inactive')).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox')).not.toBeChecked();
    await userEvent.click(canvas.getByRole('checkbox'));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const CustomLabels = {
  args: {
    checked: true,
    onChange: fn(),
    activeLabel: 'Scheduled',
    inactiveLabel: 'Unscheduled',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Scheduled')).toBeInTheDocument();
  },
};
