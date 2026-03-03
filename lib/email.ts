import nodemailer from "nodemailer";

/**
 * Transactional email service.
 * 
 * Configure with:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * 
 * For production: Use SendGrid, Resend, or AWS SES SMTP.
 * For dev: Use Mailtrap (https://mailtrap.io) or leave unconfigured.
 */

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM_EMAIL = process.env.SMTP_FROM || "no-reply@societeduvide.com";
const BRAND_NAME = "SOCIÉTÉ DU VIDE";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

/**
 * Send order confirmation email after successful reservation.
 */
export async function sendOrderConfirmation(order: {
  id: string;
  email: string;
  name: string;
  totalAmount: number;
  productTitle: string;
  quantity: number;
}) {
  if (!transporter) {
    console.log("[EMAIL] SMTP not configured — skipping order confirmation for", order.id);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
      to: order.email,
      subject: `Order Confirmed — ${BRAND_NAME}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #000;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; text-align: center; margin-bottom: 40px;">
            ${BRAND_NAME}
          </h1>
          <div style="width: 40px; height: 1px; background: #000; margin: 0 auto 40px;"></div>
          <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #666; text-align: center;">
            Order Confirmation
          </p>
          <div style="background: #f9f9f9; padding: 30px; margin: 30px 0;">
            <p style="font-size: 13px; margin: 8px 0;"><strong>Order:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
            <p style="font-size: 13px; margin: 8px 0;"><strong>Product:</strong> ${order.productTitle}</p>
            <p style="font-size: 13px; margin: 8px 0;"><strong>Qty:</strong> ${order.quantity}</p>
            <p style="font-size: 13px; margin: 8px 0;"><strong>Total:</strong> ${formatPrice(order.totalAmount)}</p>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.8;">
            Please complete your payment within 15 minutes.<br/>
            You can track your order at <a href="${process.env.NEXTAUTH_URL || 'https://societeduvide.com'}/orders/track" style="color: #000;">Track Order</a>
          </p>
          <div style="width: 40px; height: 1px; background: #eee; margin: 40px auto;"></div>
          <p style="font-size: 10px; color: #999; text-align: center; letter-spacing: 0.1em;">
            ${BRAND_NAME} — Calm, intellectual luxury.
          </p>
        </div>
      `,
    });
    console.log("[EMAIL] Order confirmation sent to", order.email);
  } catch (error) {
    console.error("[EMAIL] Failed to send order confirmation:", error);
  }
}

/**
 * Send payment success email.
 */
export async function sendPaymentSuccess(order: {
  id: string;
  email: string;
  name: string;
  totalAmount: number;
  productTitle: string;
}) {
  if (!transporter) {
    console.log("[EMAIL] SMTP not configured — skipping payment success for", order.id);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
      to: order.email,
      subject: `Payment Received — ${BRAND_NAME}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #000;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; text-align: center; margin-bottom: 40px;">
            ${BRAND_NAME}
          </h1>
          <div style="width: 40px; height: 1px; background: #000; margin: 0 auto 40px;"></div>
          <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #666; text-align: center;">
            Payment Confirmed ✓
          </p>
          <div style="background: #f9f9f9; padding: 30px; margin: 30px 0;">
            <p style="font-size: 13px; margin: 8px 0;"><strong>Order:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
            <p style="font-size: 13px; margin: 8px 0;"><strong>Product:</strong> ${order.productTitle}</p>
            <p style="font-size: 13px; margin: 8px 0;"><strong>Amount:</strong> ${formatPrice(order.totalAmount)}</p>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.8;">
            Your payment has been received. We will process your order soon.<br/>
            Track your order: <a href="${process.env.NEXTAUTH_URL || 'https://societeduvide.com'}/orders/track" style="color: #000;">Track Order</a>
          </p>
        </div>
      `,
    });
    console.log("[EMAIL] Payment success sent to", order.email);
  } catch (error) {
    console.error("[EMAIL] Failed to send payment success:", error);
  }
}

/**
 * Send shipping notification with tracking number.
 */
export async function sendShippingNotification(order: {
  id: string;
  email: string;
  name: string;
  productTitle: string;
  trackingNumber: string;
}) {
  if (!transporter) {
    console.log("[EMAIL] SMTP not configured — skipping shipping notification for", order.id);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
      to: order.email,
      subject: `Your Order Has Shipped — ${BRAND_NAME}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #000;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; text-align: center; margin-bottom: 40px;">
            ${BRAND_NAME}
          </h1>
          <div style="width: 40px; height: 1px; background: #000; margin: 0 auto 40px;"></div>
          <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #666; text-align: center;">
            Your Order Has Shipped
          </p>
          <div style="background: #f9f9f9; padding: 30px; margin: 30px 0;">
            <p style="font-size: 13px; margin: 8px 0;"><strong>Order:</strong> #${order.id.substring(0, 8).toUpperCase()}</p>
            <p style="font-size: 13px; margin: 8px 0;"><strong>Product:</strong> ${order.productTitle}</p>
            <p style="font-size: 13px; margin: 8px 0;"><strong>Tracking:</strong> <span style="font-family: monospace; color: #0066cc;">${order.trackingNumber}</span></p>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.8;">
            Your order is on its way!
          </p>
        </div>
      `,
    });
    console.log("[EMAIL] Shipping notification sent to", order.email);
  } catch (error) {
    console.error("[EMAIL] Failed to send shipping notification:", error);
  }
}

/**
 * Send password reset email with reset link.
 */
export async function sendPasswordResetEmail(data: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  if (!transporter) {
    console.log("[EMAIL] SMTP not configured — skipping password reset for", data.email);
    console.log("[EMAIL] Reset URL:", data.resetUrl);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${FROM_EMAIL}>`,
      to: data.email,
      subject: `Password Reset — ${BRAND_NAME}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #000;">
          <h1 style="font-size: 24px; font-weight: 300; letter-spacing: 0.2em; text-transform: uppercase; text-align: center; margin-bottom: 40px;">
            ${BRAND_NAME}
          </h1>
          <div style="width: 40px; height: 1px; background: #000; margin: 0 auto 40px;"></div>
          <p style="font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #666; text-align: center;">
            Password Reset Request
          </p>
          <div style="background: #f9f9f9; padding: 30px; margin: 30px 0; text-align: center;">
            <p style="font-size: 13px; margin: 0 0 20px; color: #333;">
              Hi ${data.name}, we received a request to reset your password.
            </p>
            <a href="${data.resetUrl}" 
               style="display: inline-block; background: #111; color: #fff; padding: 14px 40px; text-decoration: none; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 11px; color: #999; text-align: center; line-height: 1.8;">
            This link expires in 1 hour.<br/>
            If you didn't request this, you can ignore this email.
          </p>
          <div style="width: 40px; height: 1px; background: #eee; margin: 40px auto;"></div>
          <p style="font-size: 10px; color: #999; text-align: center; letter-spacing: 0.1em;">
            ${BRAND_NAME} — Calm, intellectual luxury.
          </p>
        </div>
      `,
    });
    console.log("[EMAIL] Password reset sent to", data.email);
  } catch (error) {
    console.error("[EMAIL] Failed to send password reset:", error);
  }
}
