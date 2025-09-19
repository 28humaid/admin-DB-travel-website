import { useState } from 'react';
import { Formik, Form } from 'formik';
import { createCustomerValidationSchema } from '@/utils/validationSchema';
import Button from '../common/button';
import InputField from '../common/inputField';
import { sendAuthEmail } from '@/lib/emailService';
import { tempPassword } from '@/utils/passwordGenerator';
import SubmittingDialog from '../common/submittingDialog';
import { userName } from '@/utils/userNameGenerator';



const CreateUser = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <>
        {isSubmitting && <SubmittingDialog/>}

        <div className="p-4 w-full md:w-3/5">
            <Formik
                initialValues={{ email1: '',email2:'',email3:'',companyName:'',phoneNumber:'',subEntity:'',gstNumber:'', addressLine1:'', addressLine2:'' }}
                validationSchema={createCustomerValidationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    setIsSubmitting(true);
                    
                    // Create an array of non-empty emails
                    const emails = [values.email1]; // email1 is mandatory
                    if (values.email2) emails.push(values.email2); // Add email2 if not empty
                    if (values.email3) emails.push(values.email3); // Add email3 if not empty

                    const combinedValues = {
                        ...values,
                        address:`${values.addressLine1}${values.addressLine2?', '+values.addressLine2:''}`
                    }
                    try {
                        // Log form values (replace with actual API call if needed)
                        console.log('Form Values:', combinedValues);

                        // /lib mei inke generators hain...
                        const username = userName
                        const password = tempPassword

                        // Call email service
                        await sendAuthEmail(emails, username, password);

                        // Simulate API call (replace with actual API call if needed)
                        await new Promise((resolve) => setTimeout(resolve, 1000));

                        console.log('Email sent successfully');
                        } catch (error) {
                        console.error('Submission error:', error);
                        setSubmissionError('Failed to send email. Please try again.');
                        } finally {
                        resetForm();
                        setIsSubmitting(false);
                        setSubmitting(false);
                        }
                }}
            >
            {({ ...formik }) => (
                <Form className="space-y-4">
                <InputField
                    type="email"
                    name="email1"
                    label="Primary Email"
                    placeholder="Enter primary email"
                    formik={formik}
                />
                <InputField
                    type="email"
                    name="email2"
                    label="Secondary Email"
                    placeholder="Enter secondary email"
                    formik={formik}
                />
                <InputField
                    type="email"
                    name="email3"
                    label="Other Email"
                    placeholder="Enter other email"
                    formik={formik}
                />
                <InputField
                    type="tel"
                    name="phoneNumber"
                    label="Phone no."
                    placeholder="Enter phone no."
                    formik={formik}
                />
                <InputField
                    type="text"
                    name="companyName"
                    label="Company Name"
                    placeholder="Enter company name"
                    formik={formik}
                />
                <InputField
                    type="text"
                    name="subEntity"
                    label="Sub entity"
                    placeholder="Enter sub entity"
                    formik={formik}
                />
                <InputField
                    type="text"
                    name="gstNumber"
                    label="GST no."
                    placeholder="Enter GST no."
                    formik={formik}
                />
                <InputField
                    type="text"
                    name="addressLine1"
                    label="Address Line 1"
                    placeholder="Enter address line 1"
                    formik={formik}
                />
                <InputField
                    type="text"
                    name="addressLine2"
                    label="Address Line 2"
                    placeholder="Enter address line 2 (optional)"
                    formik={formik}
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
    </>
  )
}

export default CreateUser