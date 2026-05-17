import './AtmInput.css';

/**
 * Input atom – text, time, and number inputs
 * variant: 'default' | 'profile' | 'auth' | 'shiftConfig' | 'number'
 */
export function AtmInput({ size = 'md', variant = 'default', className = '', ...props }) {
  const classes = [
    'atm-input',
    size ? `atm-input--${size}` : 'atm-input--md',
    variant && variant !== 'default' ? `atm-input--${variant}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <input className={classes} {...props} />
  );
}
