import './AtmToggle.css';

export function AtmToggle({ checked, onChange, activeLabel = 'Active', inactiveLabel = 'Inactive', size = 'md', className = '' }) {
    const sizeKey = size || 'md';
    return (
        <label className={`atm-toggle ${className}`}>
            <span
                className={[
                    'atm-toggle__track',
                    `atm-toggle__track--${sizeKey}`,
                    checked ? 'atm-toggle__track--checked' : 'atm-toggle__track--unchecked',
                ].join(' ')}
                onClick={onChange}
            >
                <span
                    className={[
                        'atm-toggle__thumb',
                        `atm-toggle__thumb--${sizeKey}`,
                        checked ? `atm-toggle__thumb--${sizeKey}-checked` : `atm-toggle__thumb--${sizeKey}-unchecked`,
                    ].join(' ')}
                />
            </span>
            <span className={`atm-toggle__label ${checked ? 'atm-toggle__label--active' : 'atm-toggle__label--inactive'}`}>
                {checked ? activeLabel : inactiveLabel}
            </span>
        </label>
    );
}