import { AtmText } from '../AtmText/index.js';
import { Users } from 'lucide-react';
import { BADGE_COLOR } from '../../constants/shiftColors.js';
import './MolShiftChip.css';

export function MolShiftChip({ shift, small = false }) {
    const badge = BADGE_COLOR[shift?.color] || BADGE_COLOR.blue;

    return (
        <div className={`mol-shift-chip ${small ? "mol-shift-chip--small" : ""}`}>
            <AtmText size='xs' weight='bold' className={`uppercase tracking-wider ${badge.text}`}>
                {shift?.name?.toUpperCase()}
            </AtmText>
            <AtmText size='sm' color='white' >{shift?.start_time} - {shift?.end_time}</AtmText>

            <div className='mol-shift-chip__staff'>
                <Users size={14} className='mol-shift-chip__staff-icon' />
                <AtmText size='sm' color='muted' >{shift?.min_staff} staff</AtmText>
            </div>

        </div>
    );
}