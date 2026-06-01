import { expect, fn, within } from 'storybook/test';
import { MolScheduleTableBody } from './MolScheduleBody.jsx';
import { Table } from '../AtmTable/index.js';
import { mockScheduleData, mockVisibleSlots } from '../../stories/mocks/shifts.js';
import { mockEmployeeList } from '../../stories/mocks/employees.js';

export default {
  title: 'Molecules/MolScheduleBody',
  component: MolScheduleTableBody,
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
    scheduleData: mockScheduleData,
    employeeList: mockEmployeeList,
    visibleSlots: mockVisibleSlots,
    maxSlots: 2,
    editMode: false,
    onSlotClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should render employee names
    await expect(canvas.getByText('Guilherme')).toBeInTheDocument();
  },
};

export const EditMode = {
  args: {
    scheduleData: mockScheduleData,
    employeeList: mockEmployeeList,
    visibleSlots: mockVisibleSlots,
    maxSlots: 2,
    editMode: true,
    onSlotClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // In edit mode, empty slots should show "click"
    const clickTexts = canvas.getAllByText('click');
    await expect(clickTexts.length).toBeGreaterThan(0);
  },
};
