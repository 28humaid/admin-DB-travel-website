'use server'

import sgMail from '@sendgrid/mail';

// Set the SendGrid API key (loaded from .env automatically by Next.js)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// sgMail.setDataResidency('eu'); // Uncomment if using EU subuser

export const sendAuthEmail = async (to, username, password) => {
  const msg = {
    to, // Client's email address
    from: '14.sweetsushi@gmail.com', // Replace with your verified sender
    subject: 'Your Account Credentials for logging in',
    // text: `Hello, your xxxusername is ${username} and your temporary password is ${password}. Please change your password after logging in.`,
    html: `<p>Hello, your yyyusername is <strong>${username}</strong> and your password is <strong>${password}</strong>.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error);
    throw new Error('Failed to send email');
  }
};