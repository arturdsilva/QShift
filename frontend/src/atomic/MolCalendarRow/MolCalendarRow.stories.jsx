import { expect, fn, within } from 'storybook/test';
import { MolCalendarWeekRow } from './MolCalendarRow.jsx';
import { Table, TBody } from '../AtmTable/index.js';

// Create a week of dates starting from a Monday
const baseDate = new Date(2025, 9, 27); // Oct 27, 2025 (Monday)
const mockWeek = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + i);
  return d;
});

export default {
  title: 'Molecules/MolCalendarRow',
  component: MolCalendarWeekRow,
  decorators: [
    (Story) => (
      <Table>
        <TBody>
          <Story />
        </TBody>
      </Table>
    ),
  ],
};

export const Default = {
  args: {
    week: mockWeek,
    weekIdx: 0,
    currentMonth: 10,
    selectedWeek: null,
    selectedDays: [],
    generatedWeeks: [],
    onToggleWeek: fn(),
    onDayClick: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Should render the day numbers
    await expect(canvas.getByText('27')).toBeInTheDocument();
    await expect(canvas.getByText('28')).toBeInTheDocument();
  },
};

export const WithSelectedDays = {
  args: {
    week: mockWeek,
    weekIdx: 0,
    currentMonth: 10,
    selectedWeek: 1,
    selectedDays: [mockWeek[0], mockWeek[1], mockWeek[2]],
    generatedWeeks: [],
    onToggleWeek: fn(),
    onDayClick: fn(),
  },
};
