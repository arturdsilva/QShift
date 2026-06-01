import { expect, within } from 'storybook/test';
import { MolCalendarThead } from './MolCalendarThead.jsx';
import { Table } from '../AtmTable/index.js';

export default {
  title: 'Molecules/MolCalendarThead',
  component: MolCalendarThead,
  decorators: [
    (Story) => (
      <Table>
        <Story />
      </Table>
    ),
  ],
};

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Monday')).toBeInTheDocument();
    await expect(canvas.getByText('Tuesday')).toBeInTheDocument();
    await expect(canvas.getByText('Wednesday')).toBeInTheDocument();
    await expect(canvas.getByText('Thursday')).toBeInTheDocument();
    await expect(canvas.getByText('Friday')).toBeInTheDocument();
    await expect(canvas.getByText('Saturday')).toBeInTheDocument();
    await expect(canvas.getByText('Sunday')).toBeInTheDocument();
  },
};
