import './AtmButton.css';

// ─── Base button ──────────────────────────────────────────────

/**
 * Button – blue navigation/action button (Back, Next, Save, Edit, etc.)
 */
export function Button({ onClick, children, fullWidth, responsive, size, variant = 'primary', disabled, className = '', ...props }) {
  const classes = [
    'atm-btn',
    variant ? `atm-btn--${variant}` : 'atm-btn--primary',
    size ? `atm-btn--${size}` : '',
    fullWidth ? 'atm-btn--full-width' : '',
    responsive ? 'atm-btn--responsive' : '',
    disabled ? 'atm-btn--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button onClick={onClick} disabled={disabled} className={classes} {...props}>
      {children}
    </button>
  );
}

// ─── CalendarDayButton: selected/disabled/currentMonth ────────────

export function CalendarDayButton({ onClick, selected, disabled, currentMonth = true, children, className = '', ...props }) {
  const classes = [
    'atm-calendar-day-btn',
    selected ? 'atm-calendar-day-btn--selected' : '',
    !selected && currentMonth ? 'atm-calendar-day-btn--current-month' : '',
    !selected && !currentMonth ? 'atm-calendar-day-btn--other-month' : '',
    disabled ? 'atm-calendar-day-btn--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * SelectableButton – buttons that can be selected (employee list in modals)
 */
export function SelectableButton({ onClick, children, selected, size = 'md', fullWidth, variant = 'default', className = '', ...props }) {
  const classes = [
    'atm-selectable-btn',
    variant ? `atm-selectable-btn--${variant}` : 'atm-selectable-btn--default',
    size ? `atm-selectable-btn--${size}` : 'atm-selectable-btn--md',
    fullWidth ? 'atm-selectable-btn--full-width' : '',
    selected ? 'atm-selectable-btn--selected' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * LinkButton – inline text link button (blue, underline on hover)
 */
export function LinkButton({ onClick, children, className = '', type = 'button', ...props }) {
  return (
    <button type={type} onClick={onClick} disabled={props.disabled} className={`atm-link-btn ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * AccordionButton – collapsible section header button (full width, flex between)
 */
export function AccordionButton({ onClick, children, className = '', ...props }) {
  return (
    <button onClick={onClick} className={`atm-accordion-btn ${className}`} {...props}>
      {children}
    </button>
  );
}
