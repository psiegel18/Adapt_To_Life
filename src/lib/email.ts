import { Resend } from "resend";
import { captureEmailError } from "@/lib/sentry";

// Initialize Resend - will be undefined if API key not set
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@adapttolife.org";
const ADMIN_EMAILS = process.env.ADMIN_NOTIFICATION_EMAILS?.split(",").map(e => e.trim()) || [];

// Check if email is configured
export function isEmailConfigured(): boolean {
  return resend !== null && ADMIN_EMAILS.length > 0;
}

// Form type display names
const formTypeNames: Record<string, string> = {
  contact: "Contact Form",
  volunteer: "Volunteer Application",
  corporate_sponsorship: "Corporate Sponsorship Inquiry",
  equipment_donation: "Equipment Donation",
};

// Send admin notification for new submission
export async function sendAdminNotification(
  formType: string,
  data: Record<string, string>,
  submissionId: number
): Promise<boolean> {
  if (!resend || ADMIN_EMAILS.length === 0) {
    console.log("Email not configured - skipping admin notification");
    return false;
  }

  const formName = formTypeNames[formType] || formType;
  const submitterName = data.name || data.contact_name || "Unknown";
  const submitterEmail = data.email || "Not provided";

  // Build the data summary
  const dataSummary = Object.entries(data)
    .map(([key, value]) => `<p><strong>${key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${value}</p>`)
    .join("\n");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `New ${formName} Submission from ${submitterName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B35; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New ${formName} Submission</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">
              You have received a new submission from <strong>${submitterName}</strong> (${submitterEmail}).
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Submission Details</h2>
              ${dataSummary}
            </div>
            <p style="font-size: 14px; color: #666;">
              Reference ID: #${submissionId}<br>
              View and manage this submission in your <a href="${process.env.NEXTAUTH_URL || ""}/admin">Admin Dashboard</a>.
            </p>
          </div>
          <div style="background-color: #333; padding: 15px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              AdaptToLife - Empowering Athletes
            </p>
          </div>
        </div>
      `,
    });
    console.log(`Admin notification sent for submission #${submissionId}`);
    return true;
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    captureEmailError(error, "admin_notification", formType);
    return false;
  }
}

// Send confirmation email to the person who submitted the form
export async function sendConfirmationEmail(
  formType: string,
  data: Record<string, string>,
  submissionId: number,
  successMessage: string
): Promise<boolean> {
  if (!resend) {
    console.log("Email not configured - skipping confirmation email");
    return false;
  }

  const recipientEmail = data.email;
  if (!recipientEmail) {
    console.log("No email provided - skipping confirmation email");
    return false;
  }

  const formName = formTypeNames[formType] || formType;
  const recipientName = data.name || data.contact_name || "there";

  // Customize message based on form type
  const nextSteps: Record<string, string> = {
    contact: "Our team will review your message and get back to you within 2 business days.",
    volunteer: "We'll review your application and reach out to discuss next steps. In the meantime, follow us on social media to stay updated!",
    corporate_sponsorship: "A member of our partnerships team will contact you within 2 business days to discuss sponsorship opportunities.",
    equipment_donation: "We'll review your donation and contact you to arrange pickup or drop-off. Thank you for helping athletes in need!",
  };

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Thank you for your ${formName.toLowerCase()} - AdaptToLife`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B35; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You!</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p style="font-size: 18px; color: #333;">
              Hi ${recipientName},
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              ${successMessage}
            </p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B35;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                <strong>What's Next?</strong><br>
                ${nextSteps[formType] || "We'll be in touch soon!"}
              </p>
            </div>
            <p style="font-size: 14px; color: #666;">
              Your reference number is <strong>#${submissionId}</strong>. Please keep this for your records.
            </p>
          </div>
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: white; font-size: 14px; margin: 0 0 10px 0;">
              Questions? Reply to this email or visit our website.
            </p>
            <a href="${process.env.NEXTAUTH_URL || "https://adapttolife.org"}"
               style="color: #FF6B35; text-decoration: none; font-size: 14px;">
              adapttolife.org
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 15px;">
              AdaptToLife - Empowering Athletes Through Adaptive Sports
            </p>
          </div>
        </div>
      `,
    });
    console.log(`Confirmation email sent to ${recipientEmail} for submission #${submissionId}`);
    return true;
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    captureEmailError(error, "confirmation", formType);
    return false;
  }
}
