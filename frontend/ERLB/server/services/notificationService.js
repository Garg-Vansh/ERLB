import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { logger } from '../utils/logger.js';

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
    })
  : null;

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    logger.warn('SMTP not configured, skipping email', { to, subject });
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@erlb.in',
    to,
    subject,
    html
  });
};

export const sendSMS = async ({ to, body }) => {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER || !to) {
    logger.warn('Twilio not configured, skipping SMS', { to });
    return;
  }

  await twilioClient.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body
  });
};

export const sendOrderConfirmation = async ({ user, order }) => {
  const subject = `ERLB Order Confirmed: ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `<h2>Thank you for ordering from ERLB</h2><p>Your order total is INR ${order.totalPrice}.</p><p>We will notify you once shipped.</p>`;

  await sendEmail({ to: user.email, subject, html });
  await sendSMS({
    to: user.phone,
    body: `ERLB: Order ${order._id.toString().slice(-8).toUpperCase()} confirmed. Total INR ${order.totalPrice}.`
  });
};

export const sendShippingUpdate = async ({ user, order }) => {
  const subject = `ERLB Shipping Update: ${order.shippingStatus}`;
  const html = `<h2>Your ERLB order is ${order.shippingStatus}</h2><p>Tracking ID: ${order.trackingId || 'pending'}</p><p>Tracking URL: ${order.trackingUrl || 'N/A'}</p>`;

  await sendEmail({ to: user.email, subject, html });
  await sendSMS({
    to: user.phone,
    body: `ERLB shipping update: ${order.shippingStatus}. Tracking: ${order.trackingId || 'pending'}.`
  });
};

export const sendPasswordResetEmail = async ({ email, token, resetLink }) => {
  const subject = 'ERLB Password Reset';
  const html = `<p>Use this token to reset your password: <strong>${token}</strong></p><p>Or open: <a href="${resetLink}">${resetLink}</a></p><p>Token expires in 15 minutes.</p>`;

  await sendEmail({ to: email, subject, html });
};
