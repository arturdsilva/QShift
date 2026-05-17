import { useState } from 'react';
import { User, ChevronDown, ChevronUp } from 'lucide-react';
import { SelectableButton, AccordionButton } from '../AtmButton/index.js';
import { AtmText } from '../AtmText/index.js';
import { AtmAvatar } from '../AtmAvatar/Avatar.jsx';
import './ObjEmployeeSelector.css';

/**
 * ObjEmployeeSelector – collapsible employee list panel (EmployeeReportsPage)
 */
export function ObjEmployeeSelector({ employeesList, currentEmployee, onToggleEmployee, month, year }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="obj-employee-selector">
      <AccordionButton onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          <div className="obj-employee-selector__header-icon">
            <User className="text-blue-400" size={20} />
          </div>
          <AtmText as="h3" size="lg" weight="bold" color="dimmer">Employees</AtmText>
        </div>
        {isOpen ? (
          <ChevronUp className="text-slate-400" size={20} />
        ) : (
          <ChevronDown className="text-slate-400" size={20} />
        )}
      </AccordionButton>

      {isOpen && (
        <div className="obj-employee-selector__list-wrapper">
          <div className="obj-employee-selector__list">
            {employeesList.map((emp) => {
              const isSelected = emp.id === currentEmployee.id;
              return (
                <SelectableButton
                  key={emp.id}
                  variant="default"
                  selected={isSelected}
                  onClick={() => onToggleEmployee(emp, month, year)}
                  size='md'
                  fullWidth={true}
                >
                  <div className={`obj-employee-selector__avatar-wrapper ${isSelected ? 'obj-employee-selector__avatar-wrapper--selected' : 'obj-employee-selector__avatar-wrapper--default'}`}>
                    <AtmAvatar name={emp.name} size='sm' active={emp.active} className={isSelected ? 'text-white' : 'text-slate-400'} />
                  </div>
                  <AtmText size="sm" weight="medium" className="truncate">{emp.name}</AtmText>
                  {isSelected && <div className="obj-employee-selector__active-dot" />}
                </SelectableButton>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
