// MolScheduleTableHeader.jsx
import React from 'react';
import { daysOfWeek } from '../../constants/constantsOfTable.js';
import { AtmText } from '../AtmText/Text.jsx';
import { THead, TR, TH } from '../AtmTable/index.js';
import './MolScheduleHeader.css';

export function MolScheduleTableHeader({ visibleSlots, selectedDaysMap }) {
    return (
        <THead>
            <TR>
                {daysOfWeek.map((day) => (
                    <React.Fragment key={day}>
                        {visibleSlots[day] && (
                            <TH className='mol-schedule-header__time-slot'>
                                <AtmText size="sm" color="muted" weight='bold'>
                                    Time Slot
                                </AtmText>
                            </TH>
                        )}
                        <TH className='mol-schedule-header__day-name'>
                            <AtmText size="sm" color="white" weight='bold' className='flex items-center justify-center gap-2'>
                                {day}
                            </AtmText>
                            <AtmText size="sm" color="white" weight='bold'>
                                {selectedDaysMap[day]}
                            </AtmText>
                        </TH>
                    </React.Fragment>
                ))}
            </TR>
        </THead>
    );
}