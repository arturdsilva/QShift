import { expect, within } from 'storybook/test';
import { AtmText } from './Text.jsx';

export default {
  title: 'Atoms/AtmText',
  component: AtmText,
  argTypes: {
    as: { control: 'select', options: ['span', 'p', 'h1', 'h2', 'h3', 'label', 'div'] },
    size: { control: 'select', options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '4xl'] },
    weight: { control: 'select', options: ['normal', 'medium', 'semibold', 'bold'] },
    color: { control: 'select', options: ['white', 'muted', 'faint', 'dimmer', 'green', 'red', 'blue', 'yellow', 'purple', 'orange'] },
  },
};

export const Default = {
  args: {
    children: 'Default text content',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Default text content')).toBeInTheDocument();
  },
};

export const Heading = {
  args: {
    as: 'h1',
    size: '2xl',
    weight: 'bold',
    children: 'Page Title',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('Page Title');
    await expect(heading).toBeInTheDocument();
    await expect(heading.tagName).toBe('H1');
  },
};

export const Muted = {
  args: {
    color: 'muted',
    size: 'sm',
    children: 'Muted helper text',
  },
};

export const Bold = {
  args: {
    weight: 'bold',
    size: 'lg',
    children: 'Bold text',
  },
};

export const ErrorText = {
  args: {
    as: 'p',
    size: 'xs',
    color: 'red',
    children: 'This field is required',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('This field is required')).toBeInTheDocument();
  },
};

export const LargeTitle = {
  args: {
    as: 'h1',
    size: '4xl',
    weight: 'bold',
    color: 'white',
    children: '42',
  },
};
