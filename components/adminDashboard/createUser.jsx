import { useState } from 'react';
import { Formik, Form } from 'formik';
import { createCustomerValidationSchema } from '@/utils/validationSchema';
import Button from '../common/button';
import InputField from '../common/inputField';



const CreateUser = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <>
        <div className="p-4 w-full md:w-3/5">
            <Formik
                initialValues={{ email1: '',email2:'',email3:'',companyName:'',phoneNumber:'',subEntity:'',gstNumber:'', addressLine1:'', addressLine2:'' }}
                validationSchema={createCustomerValidationSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    setIsSubmitting(true);
                    const combinedValues = {
                        ...values,
                        address:`${values.addressLine1}${values.addressLine2?', '+values.addressLine2:''}`
                    }
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