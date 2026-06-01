import { expect, fn, within, userEvent } from 'storybook/test';
import { AtmToggle } from './Toggle.jsx';

export default {
  title: 'Atoms/AtmToggle',
  component: AtmToggle,
  argTypes: {
    checked: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export const Active = {
  args: {
    checked: true,
    onChange: fn(),
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Active')).toBeInTheDocument();
  },
};

export const Inactive = {
  args: {
    checked: false,
    onChange: fn(),
    activeLabel: 'Active',
    inactiveLabel: 'Inactive',
    size: 'md',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inactive')).toBeInTheDocument();
    // Click the toggle track to trigger onChange
    const label = canvasElement.querySelector('.atm-toggle');
    const track = canvasElement.querySelector('.atm-toggle__track');
    await userEvent.click(track);
    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};

export const Small = {
  args: {
    checked: true,
    onChange: fn(),
    size: 'sm',
  },
};

export const CustomLabels = {
  args: {
    checked: true,
    onChange: fn(),
    activeLabel: 'Enabled',
    inactiveLabel: 'Disabled',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Enabled')).toBeInTheDocument();
  },
};
