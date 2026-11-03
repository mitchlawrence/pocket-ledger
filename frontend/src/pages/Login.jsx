import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import FormError from "../components/FormError";
import SubmitButton from "../components/SubmitButton";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login(form.email, form.password);
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.fields || {};
        setFieldErrors(fields);
        setError(Object.keys(fields).length ? fields.form || "" : err.message);
      } else {
        setError("Cannot reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back. Enter your details to continue."
      footer={
        <>
          No account yet?{" "}
          <Link
            to="/signup"
            className="text-leaf-400 hover:text-leaf-500 underline underline-offset-4"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormError message={error} />

        <FormField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />

        <FormField
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

        <SubmitButton loading={submitting}>Log in</SubmitButton>
      </form>
    </AuthShell>
  );
}
