"use client";

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import InputField from '../common/inputField';
import { Eye, EyeOff } from 'lucide-react';
import { adminValidationSchema } from '@/utils/validationSchema';
import Button from '../common/button';

const AdminLoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="p-4">
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={adminValidationSchema}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          setIsSubmitting(true);
          setError(null);
          try {
            const res = await signIn("credentials", {
              email: values.email,
              password: values.password,
              redirect: false,
            });

            if (res.error) {
              setError("Invalid email or password");
              setFieldError("email", "Invalid credentials");
              setFieldError("password", "Invalid credentials");
              setIsSubmitting(false);
              setSubmitting(false);
              return;
            }

            setIsSubmitting(false);
            setSubmitting(false);
            router.replace("/admin/dashboard/createUsers");
          } catch (error) {
            console.error("Login error:", error.message);
            setError(
              error.message.includes("bad auth")
                ? "Database authentication failed. Please contact support."
                : "An unexpected error occurred. Please try again."
            );
            setIsSubmitting(false);
            setSubmitting(false);
          }
        }}
      >
        {({ ...formik }) => (
          <Form className="space-y-4" disabled={isSubmitting}>
            <InputField
              type="email"
              name="email"
              label="Email"
              placeholder="Enter your email"
              formik={formik}
              aria-describedby="email-error"
            />
            <InputField
              type={showPassword ? 'text' : 'password'}
              name="password"
              label="Password"
              placeholder="Enter your password"
              formik={formik}
              icon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-white" />
                  ) : (
                    <Eye className="w-5 h-5 text-white" />
                  )}
                </button>
              }
              aria-describedby="password-error"
            />
            {error && (
              <div className="text-red-500 text-sm mt-2" role="alert" aria-live="polite">
                {error}
              </div>
            )}
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
              size="medium"
              loadingText="Checking..."
            >
              Log in
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AdminLoginForm;