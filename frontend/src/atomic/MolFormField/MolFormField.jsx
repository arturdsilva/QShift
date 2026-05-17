import { AtmText } from '../AtmText';
import { AtmInput } from '../AtmInput';
import './MolFormField.css';

/**
 * MolFormField – label + AtmInput + optional hint
 * Generic wrapper for form fields. Accepts AtmInput props directly
 * instead of using children.
 */
export function MolFormField({
  label,
  hint,
  className = '',
  // AtmInput props
  type = 'text',
  id,
  placeholder,
  value,
  onChange,
  required,
  variant = 'default',
  inputClass = '',
  disabled,
  min,
}) {
  return (
    <div className={`mol-form-field ${className}`}>
      {label && (
        <AtmText as="label" size="sm" weight="medium" color="dimmer" htmlFor={id}>
          {label}
        </AtmText>
      )}
      <AtmInput
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        variant={variant}
        className={inputClass}
        disabled={disabled}
        min={min}
      />
      {hint && (
        <AtmText as="p" size="xs" color="faint">
          {hint}
        </AtmText>
      )}
    </div>
  );
}
