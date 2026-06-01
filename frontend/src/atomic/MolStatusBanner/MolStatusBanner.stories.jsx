import { expect, fn, within, userEvent } from 'storybook/test';
import { MolStatusBanner } from './MolStatusBanner.jsx';
import { RefreshCw } from 'lucide-react';

export default {
  title: 'Molecules/MolStatusBanner',
  component: MolStatusBanner,
};

export const Info = {
  args: {
    variant: 'info',
    title: 'Generating schedule...',
    description: 'Please wait while the schedule is being generated.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Generating schedule...')).toBeInTheDocument();
    await expect(canvas.getByText('Please wait while the schedule is being generated.')).toBeInTheDocument();
  },
};

export const Warning = {
  args: {
    variant: 'warning',
    title: 'Some shifts are understaffed',
    description: '3 shifts have fewer employees than required.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Some shifts are understaffed')).toBeInTheDocument();
  },
};

export const Error = {
  args: {
    variant: 'error',
    title: 'Failed to generate schedule',
    description: 'An error occurred while processing your request.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Failed to generate schedule')).toBeInTheDocument();
  },
};

export const WithActions = {
  args: {
    variant: 'error',
    title: 'Connection failed',
    description: 'Unable to reach the server.',
    actions: [
      { label: 'Retry', icon: RefreshCw, onClick: fn(), variant: 'primary' },
      { label: 'Dismiss', onClick: fn(), variant: 'secondary' },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const retryButton = canvas.getByRole('button', { name: /Retry/i });
    await expect(retryButton).toBeInTheDocument();
    await userEvent.click(retryButton);
    await expect(args.actions[0].onClick).toHaveBeenCalledTimes(1);
  },
};
