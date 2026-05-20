import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    type = 'text',
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="form-input-wrap">
        {Icon && <Icon className="input-icon" />}
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            className={`form-input ${Icon ? 'has-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            className={`form-input ${Icon ? 'has-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

export default Input;
