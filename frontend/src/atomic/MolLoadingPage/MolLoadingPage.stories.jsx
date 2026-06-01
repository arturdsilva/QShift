import { expect, within } from 'storybook/test';
import { MolLoadingPage } from './MolLoadingPage.jsx';

export default {
  title: 'Molecules/MolLoadingPage',
  component: MolLoadingPage,
};

export const Default = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Loading...')).toBeInTheDocument();
    // Verify spinner is present
    const spinner = canvasElement.querySelector('.mol-loading-page__spinner');
    await expect(spinner).toBeInTheDocument();
  },
};
