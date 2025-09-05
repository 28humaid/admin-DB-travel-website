import * as Yup from 'yup';

// Base schema for common fields
const baseSchema = {
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Please enter password'),
};

// Customer-specific schema
export const customerValidationSchema = Yup.object({
  userid: Yup.string()
    .min(5, 'User ID must be at least 5 characters')
    .required('Please enter user ID'),
  ...baseSchema,
});

// Admin-specific schema
export const adminValidationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  ...baseSchema,
});