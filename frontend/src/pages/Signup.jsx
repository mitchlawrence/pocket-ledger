import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import AuthShell from "../components/AuthShell";
import FormField from "../components/FormField";
import FormError from "../components/FormError";
import SubmitButton from "../components/SubmitButton";

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
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

    if (form.password !== form.confirm) {
      setFieldErrors({ confirm: "Passwords do not match" });
      return;
    }

    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password);
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
      title="Create your account"
      subtitle="Your ledger is private and only visible to you."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-leaf-400 hover:text-leaf-500 underline underline-offset-4"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormError message={error} />

        <FormField
          id="name"
          name="name"
          type="text"
          label="Name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
        />

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
          autoComplete="new-password"
          hint="At least 10 characters."
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

        <FormField
          id="confirm"
          name="confirm"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={handleChange}
          error={fieldErrors.confirm}
        />

        <SubmitButton loading={submitting}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
