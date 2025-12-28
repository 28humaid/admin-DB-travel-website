import { useState } from "react";
import { Formik, Form } from "formik";
import { createCustomerValidationSchema } from "@/utils/validationSchema";
import { useSession } from 'next-auth/react';
import { apiRequest } from '@/utils/apiRequest'; 
import Button from "../common/button";
import InputField from "../common/inputField";
import FeedbackDialog from "../common/feedbackDialog";
import { getAuthToken } from "@/utils/getAuthToken";
import { useQueryClient } from '@tanstack/react-query';
import Loader from "../common/loader";


const CreateUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    message: "",
    isError: false,
  });

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, message: "", isError: false });
  };

  if (!session) {
    return <Loader message="Please wait..."/>;
  }

  return (
    <>
      <FeedbackDialog
        isOpen={dialogState.isOpen}
        message={dialogState.message}
        isError={dialogState.isError}
        onClose={handleCloseDialog}
      />
      <div className="p-4 w-full md:w-3/5 relative">
        <Formik
          initialValues={{
            email1: "",
            email2: "",
            email3: "",
            companyName: "",
            mobileNo: "",
            subEntity: "",
            subCorporate: "",
            gstNo: "",
            addressLine1: "",
            addressLine2: "",
          }}
          validationSchema={createCustomerValidationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setDialogState({ isOpen: true, message: "Submitting...", isError: false });

            try {
              const result = await apiRequest({
                url: "/api/customers/create",
                method: "POST",
                body: values,
                token: getAuthToken(),
              });
              queryClient.invalidateQueries(['customers']);
              
              setDialogState({
                isOpen: true,
                message: result.message || "Customer created successfully",
                isError: false,
              });
              resetForm();
            } catch (error) {
              console.error("Submission error:", error);
              let errorMessage = "Failed to create customer. Please try again.";
              if (error.message.includes("Network error")) {
                errorMessage = "Network error: Failed to connect to the server.";
              }
              setDialogState({ isOpen: true, message: errorMessage, isError: true });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, ...formik }) => (
            <Form className="space-y-4">
              <InputField
                type="email"
                name="email1"
                label="Primary Email"
                placeholder="Enter primary email"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="email"
                name="email2"
                label="Secondary Email"
                placeholder="Enter secondary email"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="email"
                name="email3"
                label="Other Email"
                placeholder="Enter other email"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="tel"
                name="mobileNo"
                label="Phone no."
                placeholder="Enter phone no."
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="text"
                name="companyName"
                label="Company Name"
                placeholder="Enter company name"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="text"
                name="subCorporate"
                label="Sub-Corporate"
                placeholder="Enter sub-corporate name"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="text"
                name="subEntity"
                label="Sub entity"
                placeholder="Enter sub entity"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="text"
                name="gstNo"
                label="GST no."
                placeholder="Enter GST no."
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="text"
                name="addressLine1"
                label="Address Line 1"
                placeholder="Enter address line 1"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="text"
                name="addressLine2"
                label="Address Line 2"
                placeholder="Enter address line 2 (optional)"
                formik={formik}
                disabled={isSubmitting}
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
  );
};

export default CreateUser;