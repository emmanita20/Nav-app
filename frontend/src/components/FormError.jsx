import React from "react";

const FormError = ({ children }) => {
  if (!children) return null;
  return <div className="error-message" style={{ marginTop: "0.5rem" }}>{children}</div>;
};

export default FormError;
