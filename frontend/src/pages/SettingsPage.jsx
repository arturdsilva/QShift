import { Settings } from 'lucide-react';
import BaseLayout from '../layouts/BaseLayout.jsx';
import Header from '../components/Header.jsx';

function SettingsPage({}) {
    
    return (
        <BaseLayout currentPage={4}>
            <Header title="System Settings" icon={Settings}/>
            <div className="space-y-4">
                <div className="text-slate-400">
                Configurations under development...
                </div>
            </div>
        </BaseLayout>
    )
}

export default SettingsPage;