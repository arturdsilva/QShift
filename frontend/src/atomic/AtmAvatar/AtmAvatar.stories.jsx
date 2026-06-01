import { expect, within } from 'storybook/test';
import { AtmAvatar } from './Avatar.jsx';

export default {
  title: 'Atoms/AtmAvatar',
  component: AtmAvatar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    active: { control: 'boolean' },
  },
};

export const Default = {
  args: {
    name: 'Guilherme Silva',
    active: true,
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should render initials "GS"
    const avatar = canvas.getByText('GS');
    await expect(avatar).toBeInTheDocument();
  },
};

export const Active = {
  args: {
    name: 'Artur Costa',
    active: true,
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('AC')).toBeInTheDocument();
  },
};

export const Inactive = {
  args: {
    name: 'Gabriel Rocha',
    active: false,
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('GR')).toBeInTheDocument();
  },
};

export const Small = {
  args: {
    name: 'Arthur Lima',
    active: true,
    size: 'sm',
  },
};

export const Large = {
  args: {
    name: 'Ângelo Martins',
    active: true,
    size: 'lg',
  },
};

export const SingleName = {
  args: {
    name: 'Guilherme',
    active: true,
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Single name should show just one initial
    await expect(canvas.getByText('G')).toBeInTheDocument();
  },
};
