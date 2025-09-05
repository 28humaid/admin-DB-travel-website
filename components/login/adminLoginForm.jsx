"use client"

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import InputField from '../common/inputField';
import { Eye, EyeOff } from 'lucide-react';
import { adminValidationSchema } from '@/utils/validationSchema';
import Button from '../common/button';

const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="p-4">
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={adminValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setIsSubmitting(true);
          console.log(values); // Replace with actual API call
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
          setIsSubmitting(false);
          setSubmitting(false);
        }}
      >
        {({ ...formik }) => (
          <Form className="space-y-4">
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
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
              size="medium"
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AdminLoginForm;