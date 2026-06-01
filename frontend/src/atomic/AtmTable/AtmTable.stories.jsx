import { expect, fn, within, userEvent } from 'storybook/test';
import { Table, THead, TBody, TR, TH, TD } from './Table.jsx';

export default {
  title: 'Atoms/AtmTable',
  component: Table,
};

export const BasicTable = {
  render: () => (
    <Table>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH>Role</TH>
          <TH>Status</TH>
        </TR>
      </THead>
      <TBody>
        <TR>
          <TD>Guilherme</TD>
          <TD>Manager</TD>
          <TD>Active</TD>
        </TR>
        <TR>
          <TD>Artur</TD>
          <TD>Employee</TD>
          <TD>Active</TD>
        </TR>
      </TBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getByText('Guilherme')).toBeInTheDocument();
    await expect(canvas.getByText('Artur')).toBeInTheDocument();
  },
};

export const WithClickableCell = {
  render: (args) => (
    <Table>
      <TBody>
        <TR>
          <TD clickable onClick={args.onClick}>Click me</TD>
          <TD>Normal cell</TD>
        </TR>
      </TBody>
    </Table>
  ),
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const clickableCell = canvas.getByText('Click me');
    await userEvent.click(clickableCell);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const UnderStaffedCell = {
  render: () => (
    <Table>
      <TBody>
        <TR>
          <TD underStaffed>Understaffed</TD>
          <TD>Normal</TD>
        </TR>
      </TBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Understaffed')).toBeInTheDocument();
  },
};

export const DayOffRow = {
  render: () => (
    <Table>
      <TBody>
        <TR dayOff>
          <TD dayOff>Day off content</TD>
        </TR>
      </TBody>
    </Table>
  ),
};
