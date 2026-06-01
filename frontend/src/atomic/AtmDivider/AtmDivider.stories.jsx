import { expect, within } from 'storybook/test';
import { AtmDivider } from './Divider.jsx';

export default {
  title: 'Atoms/AtmDivider',
  component: AtmDivider,
};

export const Default = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Divider renders a div with class atm-divider
    const divider = canvasElement.querySelector('.atm-divider');
    await expect(divider).toBeInTheDocument();
  },
};
