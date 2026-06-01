import { expect, fn, within, userEvent } from 'storybook/test';
import { MolFormField } from './MolFormField.jsx';

export default {
  title: 'Molecules/MolFormField',
  component: MolFormField,
};

export const Default = {
  args: {
    label: 'Email',
    id: 'email-field',
    placeholder: 'Enter your email',
    value: '',
    onChange: fn(),
    type: 'email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Email')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  },
};

export const WithHint = {
  args: {
    label: 'Password',
    hint: 'Must be at least 8 characters',
    id: 'password-field',
    placeholder: 'Enter password',
    value: '',
    onChange: fn(),
    type: 'password',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Password')).toBeInTheDocument();
    await expect(canvas.getByText('Must be at least 8 characters')).toBeInTheDocument();
  },
};

export const Required = {
  args: {
    label: 'Name',
    id: 'name-field',
    placeholder: 'Enter name',
    value: '',
    onChange: fn(),
    required: true,
  },
};

export const DisabledField = {
  args: {
    label: 'Disabled Field',
    id: 'disabled-field',
    placeholder: 'Cannot edit',
    value: 'Fixed value',
    onChange: fn(),
    disabled: true,
  },
};
