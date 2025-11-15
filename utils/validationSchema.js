import * as Yup from 'yup';

// Base schema for common fields
const baseSchema = {
  password: Yup.string().required('Please enter password'),
};

// Admin-specific schema
export const adminValidationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Please enter email'),
  ...baseSchema,
});

export const createCustomerValidationSchema = Yup.object({
    email1: Yup.string()
        .email('Please enter a valid email')
        .required('Please enter email'),
    companyName:Yup.string().required('Please enter the company name'),
    mobileNo:Yup.string().matches(/^[0-9]+$/, 'Phone number must contain only digits').min(10,'Phone no. cannot be less than 10 digits').max(10,'Phone no. cannot be greater than 10 digits'),
    gstNo:Yup.string().required('Please enter GST no.').min(15,'GST no. cannot be less than 15 digits').max(15,'GST no. cannot be greater than 15 digits')

});

export const editCustomerValidationSchema = Yup.object({
    companyName:Yup.string().required('Please enter the company name'),
    mobileNo:Yup.string().matches(/^[0-9]+$/, 'Phone number must contain only digits').min(10,'Phone no. cannot be less than 10 digits').max(10,'Phone no. cannot be greater than 10 digits'),
    gstNo:Yup.string().required('Please enter GST no.').min(15,'GST no. cannot be less than 15 digits').max(15,'GST no. cannot be greater than 15 digits')

});