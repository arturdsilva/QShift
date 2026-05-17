import { Plus } from 'lucide-react';
import { AtmText } from '../AtmText/index.js';
import './MolAddEmployeeCard.css';

/**
 * MolAddEmployeeCard – card to add a new employee
 */
export function MolAddEmployeeCard({ onAdd }) {
    return (
        <button
            onClick={onAdd}
            className="mol-add-employee-card"
        >
            <div className="mol-add-employee-card__icon-wrapper">
                <Plus className="mol-add-employee-card__icon" />
            </div>
            <AtmText size="sm" color="muted" className="mol-add-employee-card__text">
                Add New Employee
            </AtmText>
        </button>
    );
}