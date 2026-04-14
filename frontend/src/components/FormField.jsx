import React from "react";

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required,
  ...inputProps
}) => {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="form-input"
        aria-invalid={!!error}
        required={required}
        {...inputProps}
      />
      {error && <div className="error-message" style={{ marginTop: "0.5rem" }}>{error}</div>}
    </div>
  );
};

export default FormField;
