import './AtmTable.css';

export function Table({ className = '', children, ...props }) {
    return (
        <table className={`atm-table ${className}`} {...props}>
            {children}
        </table>
    );
}

export function THead({ className = '', children, ...props }) {
    return <thead className={`atm-thead ${className}`} {...props}>{children}</thead>;
}

export function TBody({ className = '', children, ...props }) {
    return <tbody className={className} {...props}>{children}</tbody>;
}

export function TR({ className = '', children, dayOff, calendarHeader, calendarBody, ...props }) {
    const classes = [
        'atm-tr',
        dayOff ? 'atm-tr--day-off' : '',
        calendarHeader ? 'atm-tr--calendar-header' : '',
        calendarBody ? 'atm-tr--calendar-body' : '',
        className,
    ].filter(Boolean).join(' ');
    return <tr className={classes} {...props}>{children}</tr>;
}

export function TH({ className = '', children, calendarHeader, ...props }) {
    const classes = [
        'atm-th',
        calendarHeader ? 'atm-th--calendar-header' : '',
        className,
    ].filter(Boolean).join(' ');
    return <th className={classes} {...props}>{children}</th>;
}

export function TD({ className = '', children, underStaffed, clickable, timeSlot, onClick, dayOff, calendarBody, ...props }) {
    const classes = [
        'atm-td',
        underStaffed ? 'atm-td--under-staffed' : '',
        clickable ? 'atm-td--clickable' : '',
        timeSlot ? 'atm-td--time-slot' : '',
        dayOff ? 'atm-td--day-off' : '',
        calendarBody ? 'atm-td--calendar-body' : '',
        className,
    ].filter(Boolean).join(' ');
    return (
        <td onClick={onClick} className={classes} {...props}>
            {children}
        </td>
    );
}