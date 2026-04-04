import { AtmText } from '../AtmText/index.js';
import { Users } from 'lucide-react';
import { BADGE_COLOR } from '../../constants/shiftColors.js';

export function MolShiftChip({ shift, small = false }) {
    const badge = BADGE_COLOR[shift?.color] || BADGE_COLOR.blue;

    return (
        <div className={`flex flex-col items-start justify-center rounded-[7px] mb-1 border border-[#1e2d47] ${small ? "px-[8px] py-[5px]" : "px-[20px] py-[7px]"}`}>
            <AtmText size='xs' weight='bold' className={`uppercase tracking-wider ${badge.text}`}>
                {shift?.name?.toUpperCase()}
            </AtmText>
            <AtmText size='sm' color='white' >{shift?.start_time} - {shift?.end_time}</AtmText>

            <div className='flex items-center justify-center gap-1'>
                <Users size={14} className='text-slate-400' />
                <AtmText size='sm' color='muted' >{shift?.min_staff} staff</AtmText>
            </div>

        </div>
    );
}