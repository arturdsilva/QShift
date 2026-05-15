import { useState } from 'react';
import { Menu } from 'lucide-react';
import { MolSidebar } from '../MolSidebar';
import { MolWeekSelection } from '../MolWeekSelection';
import { MolDaysSelection } from '../MolDaysSelection';
import { Button } from '../AtmButton/index.js';
import { AtmText } from '../AtmText/index.js';
import './ObjAppLayout.css';

/**
 * ObjAppLayout – main app shell with optional sidebar and selection panel.
 * Replaces layouts/BaseLayout.jsx.
 *
 * Props:
 *   children         page content
 *   showSidebar?     (default true) show the left sidebar
 *   showSelectionPanel? (default false) show the right selection panel
 *   selectionPanelData? { startDate, selectedDays }
 *   currentPage      number identifying the active nav item
 */
export function ObjAppLayout({
  children,
  showSidebar = true,
  showSelectionPanel = false,
  selectionPanelData,
  currentPage,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="obj-app-layout">
      {/* Mobile top bar */}
      {showSidebar && (
        <div className="obj-app-layout__topbar">
          <Button onClick={() => setIsSidebarOpen(true)} variant='ghost'>
            <Menu size={24} />
          </Button>
          <AtmText size="lg" weight="bold" className="obj-app-layout__brand">QShift</AtmText>
        </div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <>
          {isSidebarOpen && (
            <div
              className="obj-app-layout__sidebar-overlay"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <div
            className={`obj-app-layout__sidebar ${isSidebarOpen ? 'obj-app-layout__sidebar--open' : ''}`}
          >
            <MolSidebar currentPage={currentPage} onClose={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div
        className={`obj-app-layout__content-wrapper ${showSidebar ? 'obj-app-layout__content-wrapper--with-sidebar' : ''
          }`}
      >
        <div className="obj-app-layout__content">{children}</div>

        {showSelectionPanel && selectionPanelData && (
          <div className="obj-app-layout__selection-panel">
            <div className="obj-app-layout__selection-panel-inner">
              <MolWeekSelection
                startDate={selectionPanelData.startDate}
                selectedDays={selectionPanelData.selectedDays}
              />
              <MolDaysSelection selectedDays={selectionPanelData.selectedDays} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
