import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../services/store";
import FormField from "../components/FormField";
import "../styles/SignupPage.css";

const SignupPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [fieldErrors, setFieldErrors] = useState({ firstName: "", lastName: "", email: "", password: "" });

  const validateEmail = (value) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  };

  const validatePassword = (value) => {
    return value && value.length >= 6;
  };

  const updateFieldError = (name, value) => {
    let message = "";
    if ((name === "firstName" || name === "lastName") && !value) message = "Required";
    if (name === "email") {
      if (!value) message = "Email is required";
      else if (!validateEmail(value)) message = "Enter a valid email";
    }
    if (name === "password") {
      if (!value) message = "Password is required";
      else if (!validatePassword(value)) message = "Password must be at least 6 characters";
    }
    setFieldErrors((s) => ({ ...s, [name]: message }));
    return message === "";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    const f1 = updateFieldError("firstName", firstName);
    const f2 = updateFieldError("lastName", lastName);
    const f3 = updateFieldError("email", email);
    const f4 = updateFieldError("password", password);
    if (!f1 || !f2 || !f3 || !f4) return;

    try {
      await signup({ firstName, lastName, email, password, phone });
      navigate("/home");
    } catch (err) {
      setError(err?.message || err || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Create Account</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup}>
          <FormField label="First Name" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} onBlur={(e)=>updateFieldError('firstName', e.target.value)} error={fieldErrors.firstName} required />
          <FormField label="Last Name" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} onBlur={(e)=>updateFieldError('lastName', e.target.value)} error={fieldErrors.lastName} required />
          <FormField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={(e)=>updateFieldError('email', e.target.value)} error={fieldErrors.email} required />
          <FormField label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onBlur={(e)=>updateFieldError('password', e.target.value)} error={fieldErrors.password} required />

          <FormField label="Phone (optional)" name="phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} />

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}> {isLoading ? 'Creating...' : 'Sign up'}</button>
        </form>

        <p className="login-footer">Already have an account? <button onClick={()=>navigate('/login')} className="login-link">Log in</button></p>
      </div>
    </div>
  );
};

export default SignupPage;
