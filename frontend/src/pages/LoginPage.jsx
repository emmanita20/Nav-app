import React, { useState } from "react";
import { useAuthStore } from "../services/store";
import { useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login, sendOtp, verifyOtp, isLoading } = useAuthStore();

  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "", phone: "" });

  const validateEmail = (value) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(value).toLowerCase());
  };

  const validatePassword = (value) => {
    return value && value.length >= 6;
  };

  const updateFieldError = (name, value) => {
    let message = "";
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const emailOk = updateFieldError("email", email);
    const passOk = updateFieldError("password", password);
    if (!emailOk || !passOk) return;

    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Login failed");
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setFieldErrors((s) => ({ ...s, phone: "Phone number is required" }));
      return;
    }

    try {
      await sendOtp(phone.trim());
      setStep("otp-code");
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "Unable to send OTP");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code sent to your phone");
      return;
    }

    try {
      await verifyOtp(phone.trim(), otp);
      navigate("/home");
    } catch (err) {
      setError(typeof err === "string" ? err : err?.message || "OTP verification failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Navi-App</h1>

        {error && <div className="error-message">{error}</div>}

        {step === "login" && (
          <form onSubmit={handleLogin}>
            <FormField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => updateFieldError("email", e.target.value)}
              error={fieldErrors.email}
              required
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => updateFieldError("password", e.target.value)}
              error={fieldErrors.password}
              required
            />

            <button
              type="submit"
              disabled={isLoading || !email || !password || fieldErrors.email || fieldErrors.password}
              className="btn btn-primary btn-full"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <button type="button" onClick={() => setStep("otp-phone")} className="btn btn-success btn-full btn-mt">
              Use phone OTP
            </button>
          </form>
        )}

        {step === "otp-phone" && (
          <form onSubmit={handleSendOTP}>
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((s) => ({ ...s, phone: "" }));
              }}
              error={fieldErrors.phone}
              className="form-input"
            />
            <button className="btn btn-primary btn-full" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
            <button type="button" onClick={() => setStep("login")} className="login-link login-secondary-action">
              Back to email login
            </button>
          </form>
        )}

        {step === "otp-code" && (
          <form onSubmit={handleVerifyOTP}>
            <p className="login-helper">Enter the 6-digit code sent to {phone}.</p>
            <FormField
              label="OTP Code"
              name="otp"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
            />
            <button className="btn btn-primary btn-full" type="submit" disabled={isLoading || otp.length !== 6}>
              {isLoading ? "Verifying..." : "Verify and continue"}
            </button>
            <button type="button" onClick={() => setStep("otp-phone")} className="login-link login-secondary-action">
              Change phone number
            </button>
          </form>
        )}

        <p className="login-footer">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="login-link">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
