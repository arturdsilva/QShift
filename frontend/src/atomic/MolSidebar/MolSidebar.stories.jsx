import { expect, fn, within, userEvent } from 'storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { MolSidebar } from './MolSidebar.jsx';

export default {
  title: 'Molecules/MolSidebar',
  component: MolSidebar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: '260px', height: '500px' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export const Default = {
  args: {
    currentPage: 1,
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Create Schedule')).toBeInTheDocument();
    await expect(canvas.getByText('Templates')).toBeInTheDocument();
    await expect(canvas.getByText('Reports')).toBeInTheDocument();
    await expect(canvas.getByText('Logout')).toBeInTheDocument();
  },
};

export const TemplatesPage = {
  args: {
    currentPage: 11,
    onClose: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Templates')).toBeInTheDocument();
  },
};

export const ReportsPage = {
  args: {
    currentPage: 3,
    onClose: fn(),
  },
};
