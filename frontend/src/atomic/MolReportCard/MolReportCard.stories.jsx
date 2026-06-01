import { expect, fn, within, userEvent } from 'storybook/test';
import { MolReportCard } from './MolReportCard.jsx';
import { Users } from 'lucide-react';

export default {
  title: 'Molecules/MolReportCard',
  component: MolReportCard,
};

export const Default = {
  args: {
    card: {
      icon: Users,
      value: '42',
      title: 'Total Employees',
    },
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('42')).toBeInTheDocument();
    await expect(canvas.getByText('Total Employees')).toBeInTheDocument();
    const card = canvasElement.querySelector('.mol-report-card');
    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
