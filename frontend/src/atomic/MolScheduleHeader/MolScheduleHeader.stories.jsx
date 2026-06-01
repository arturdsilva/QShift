import { expect, within } from 'storybook/test';
import { MolScheduleTableHeader } from './MolScheduleHeader.jsx';
import { Table } from '../AtmTable/index.js';
import { mockVisibleSlots, mockSelectedDaysMap } from '../../stories/mocks/shifts.js';

export default {
  title: 'Molecules/MolScheduleHeader',
  component: MolScheduleTableHeader,
  decorators: [
    (Story) => (
      <Table>
        <Story />
      </Table>
    ),
  ],
};

export const Default = {
  args: {
    visibleSlots: mockVisibleSlots,
    selectedDaysMap: mockSelectedDaysMap,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Monday')).toBeInTheDocument();
    await expect(canvas.getByText('Friday')).toBeInTheDocument();
    // Should show day numbers
    await expect(canvas.getByText('27')).toBeInTheDocument();
  },
};
