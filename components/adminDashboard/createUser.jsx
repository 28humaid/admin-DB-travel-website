import { useState } from "react";
import { Formik, Form } from "formik";
import { createCustomerValidationSchema } from "@/utils/validationSchema";
import { useSession } from 'next-auth/react'; // Added for authentication
import Button from "../common/button";
import InputField from "../common/inputField";
import FeedbackDialog from "../common/feedbackDialog";

const CreateUser = () => {
  const { data: session } = useSession(); // Added to access session and token
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    message: "",
    isError: false,
  });

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, message: "", isError: false });
  };

  // Added: Handle unauthenticated state
  if (!session) {
    return <div className="p-4">Please log in to create a user.</div>;
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
        {/* Overlay to block form interaction during submission */}
        {/* {dialogState.isOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
        )} */}
        <Formik
          initialValues={{
            email1: "",
            email2: "",
            email3: "",
            companyName: "",
            phoneNumber: "",
            subEntity: "",
            gstNumber: "",
            addressLine1: "",
            addressLine2: "",
          }}
          validationSchema={createCustomerValidationSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setDialogState({ isOpen: true, message: "Submitting...", isError: false });

            try {
              const response = await fetch("/api/customers/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session?.accessToken}`, // Added: Authentication header
                },
                body: JSON.stringify(values),
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  errorData.message || `Failed to create customer (Error ${response.status})`
                );
              }

              const result = await response.json();
              setDialogState({
                isOpen: true,
                message: result.message || "Customer created successfully",
                isError: false,
              });
              resetForm();
            } catch (error) {
              console.error("Submission error:", error);
              let errorMessage = "Failed to create customer. Please try again.";
              if (error.message.includes("Failed to connect to database")) {
                errorMessage = "Database connection failed. Please try again later.";
              } else if (error.message.includes("Error 400")) {
                errorMessage = "Invalid input data (Error 400).";
              } else if (error.message.includes("Error 500")) {
                errorMessage = "Server error (Error 500). Please try again later.";
              } else if (error.message.includes("401")) { // Added: Handle auth-specific errors
                errorMessage = "Authentication failed. Please log in again.";
              }
              setDialogState({ isOpen: true, message: errorMessage, isError: true });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting,...formik }) => (
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
                name="phoneNumber"
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
                name="subEntity"
                label="Sub entity"
                placeholder="Enter sub entity"
                formik={formik}
                disabled={isSubmitting}
              />
              <InputField
                type="text"
                name="gstNumber"
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