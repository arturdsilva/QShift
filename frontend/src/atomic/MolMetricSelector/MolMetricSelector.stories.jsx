import { expect, fn, within, userEvent } from 'storybook/test';
import { MolMetricSelector } from './MolMetricSelector.jsx';
import { METRIC_COLORS } from '../../constants/employeeStatsConfig.js';

const mockMetrics = [
  { key: 'daysOff', label: 'Days Off' },
  { key: 'daysWorked', label: 'Days Worked' },
  { key: 'hoursWorked', label: 'Hours Worked' },
];

export default {
  title: 'Molecules/MolMetricSelector',
  component: MolMetricSelector,
};

export const Default = {
  args: {
    metrics: mockMetrics,
    selectedMetric: 'daysOff',
    onSelect: fn(),
    colors: METRIC_COLORS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Days Off')).toBeInTheDocument();
    await expect(canvas.getByText('Days Worked')).toBeInTheDocument();
    await expect(canvas.getByText('Hours Worked')).toBeInTheDocument();
    // Click a different metric
    await userEvent.click(canvas.getByText('Days Worked'));
    await expect(args.onSelect).toHaveBeenCalledWith('daysWorked');
  },
};
