import { expect, fn, within, userEvent } from 'storybook/test';
import { AtmInput } from './Input.jsx';

export default {
  title: 'Atoms/AtmInput',
  component: AtmInput,
  argTypes: {
    variant: { control: 'select', options: ['default', 'profile', 'auth', 'shiftConfig', 'number'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['text', 'time', 'number', 'password', 'email'] },
  },
};

export const Default = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
    onChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Enter text...');
    await expect(input).toBeInTheDocument();
    await userEvent.type(input, 'Hello');
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const Profile = {
  args: {
    placeholder: 'Enter the name...',
    variant: 'profile',
    type: 'text',
    onChange: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByPlaceholderText('Enter the name...')).toBeInTheDocument();
  },
};

export const TimeInput = {
  args: {
    type: 'time',
    value: '08:00',
    variant: 'shiftConfig',
    onChange: fn(),
  },
};

export const NumberInput = {
  args: {
    type: 'text',
    placeholder: 'No specific workload',
    variant: 'number',
    onChange: fn(),
  },
};

export const AuthInput = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
    variant: 'auth',
    onChange: fn(),
  },
};
