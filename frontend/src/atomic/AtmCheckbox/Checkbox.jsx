import './AtmCheckbox.css';

/**
 * AtmCheckbox – styled checkbox with active/inactive label
 */
export function AtmCheckbox({ checked, onChange, activeLabel = 'Active', inactiveLabel = 'Inactive', className = '' }) {
  return (
    <label className={`atm-checkbox ${className}`}>
      <div className="atm-checkbox__input-wrapper">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="atm-checkbox__input"
        />
        {checked && (
          <svg
            className="atm-checkbox__check-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`atm-checkbox__label ${checked ? 'atm-checkbox__label--active' : 'atm-checkbox__label--inactive'}`}>
        {checked ? activeLabel : inactiveLabel}
      </span>
    </label>
  );
}
