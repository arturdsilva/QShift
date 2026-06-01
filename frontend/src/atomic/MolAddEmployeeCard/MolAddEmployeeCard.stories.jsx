import { expect, fn, within, userEvent } from 'storybook/test';
import { MolAddEmployeeCard } from './MolAddEmployeeCard.jsx';

export default {
  title: 'Molecules/MolAddEmployeeCard',
  component: MolAddEmployeeCard,
};

export const Default = {
  args: {
    onAdd: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Add New Employee')).toBeInTheDocument();
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(args.onAdd).toHaveBeenCalledTimes(1);
  },
};
