import './AtmAvatar.css';

function getInitials(name = '') {
    return name
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

export function AtmAvatar({ name, active, size = 'md', className = '' }) {
    return (
        <div className={`atm-avatar atm-avatar--${size} ${className}`}>
            {getInitials(name)}
            <span
                className={[
                    'atm-avatar__status-dot',
                    `atm-avatar__status-dot--${size}`,
                    active ? 'atm-avatar__status-dot--active' : 'atm-avatar__status-dot--inactive',
                ].join(' ')}
            />
        </div>
    );
}