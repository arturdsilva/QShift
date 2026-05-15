import './AtmText.css';

/**
 * AtmText – typography variants
 * size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '4xl'
 * weight: 'normal' | 'medium' | 'semibold' | 'bold'
 * color: 'white' | 'muted' | 'faint' | 'dimmer' | 'green' | 'red' | 'blue' | 'yellow' | 'purple' | 'orange'
 * hoverGroupColor: 'white' | 'muted' | 'indigo'
 */
export function AtmText({
  as: Tag = 'span',
  size = 'base',
  weight = 'normal',
  color = 'white',
  hoverGroupColor,
  className = '',
  children,
  ...props
}) {
  const classes = [
    size ? `atm-text--${size}` : 'atm-text--base',
    weight ? `atm-text--${weight}` : 'atm-text--normal',
    color ? `atm-text--${color}` : 'atm-text--white',
    hoverGroupColor ? `atm-text--hover-${hoverGroupColor}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
