import { AtmText } from "../AtmText/Text.jsx";
import { SelectableButton, Button } from "../AtmButton/index.js";
import { AtmAvatar } from "../AtmAvatar/index.js";
import { Check } from "lucide-react";
import './MolSlotEmployeePicker.css';

/**
 * MolSlotEmployeesPicker – employee selector for a time slot
 */
export function MolSlotEmployeesPicker({ day, slot, assignedEmployees, employeeList, onToggleEmployee, onClose }) {
    return (
        <div className="mol-slot-picker">
            <div className="mol-slot-picker__info">
                {day} | {slot.startTime} - {slot.endTime} {' '}
                <AtmText as="span" size="sm" color="muted">
                    ({assignedEmployees.length}/{slot.minEmployees} employees)
                </AtmText>
            </div>
            <div className="mol-slot-picker__list">
                {employeeList
                    .filter((emp) => emp.active)
                    .map((emp) => {
                        const isSelected = assignedEmployees.some((assignedEmp) => assignedEmp.id === emp.id);
                        return (
                            <SelectableButton
                                key={emp.id}
                                variant="default"
                                selected={isSelected}
                                onClick={() => onToggleEmployee(emp, slot, day)}
                                size='md'
                                fullWidth={true}
                            >
                                <div className={`mol-slot-picker__avatar-wrapper ${isSelected ? 'mol-slot-picker__avatar-wrapper--selected' : 'mol-slot-picker__avatar-wrapper--default'}`}>
                                    <AtmAvatar name={emp.name} active={emp.active} size='sm' />
                                </div>
                                <div className="flex items-center justify-between">
                                    <AtmText as="span" size="md" color="white" className="mol-slot-picker__name">{emp.name}</AtmText>
                                </div>
                                {isSelected && <Check size={20} className='mol-slot-picker__check' />}
                            </SelectableButton>
                        );
                    })}
            </div>
            <Button onClick={onClose} fullWidth variant='primary' size='lg'>
                Finish
            </Button>
        </div>
    );
}