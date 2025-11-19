import Sidebar from '../components/Sidebar';
import SelectionPanel from '../components/SelectionPanel';

function BaseLayout({
    children,
    showSidebar = true,
    showSelectionPanel = false,
    selectionPanelData,
    currentPage
}) {
    return (
        <div className="flex h-screen bg-slate-900">
            {showSidebar && <Sidebar currentPage={currentPage}/>}

            <div  className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-8 overflow-auto">
                    {children}
                </div>

                {showSelectionPanel && selectionPanelData && (
                    <SelectionPanel {...selectionPanelData}/>
                )}
            </div>
        </div>
    );
}

export default BaseLayout;