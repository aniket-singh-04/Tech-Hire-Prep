import { ENV } from "../config/envConfig.ts";
import { buildOtpEmailTemplate, getEmailAppUrl, getEmailBrandName } from "../utils/emailTemplate.ts"
import nodemailer from "nodemailer";

const transport = ENV.SMTP_HOST ? nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  secure: ENV.SMTP_PORT === 465,
  auth: ENV.SMTP_USER
    ? {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    }
    : undefined,
})
  : nodemailer.createTransport({
    jsonTransport: true,
  });

export const sendMail = async (payload: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) =>
  transport.sendMail({
    from: ENV.EMAIL_FROM,
    ...payload,
  });

const sendOtpMail = async (input: {
  to: string;
  otp: string;
  subject: string;
  introText: string;
}) => {
  const brandName = getEmailBrandName();
  const expiresInText = `${ENV.OTP_TTL_MINUTES} minutes`;

  await sendMail({
    to: input.to,
    subject: input.subject || `Your ${brandName} verification code`,
    text: [
      `${brandName} verification code`,
      "",
      input.introText || "Use the one-time passcode below to continue.",
      "",
      `Code: ${input.otp}`,
      `Expires in: ${expiresInText}`,
      "",
      "If you did not request this code, you can safely ignore this email.",
      "",
      getEmailAppUrl(),
    ].join("\n"),
    html: buildOtpEmailTemplate({
      preheader: `${input.otp} is your ${brandName} verification code.`,
      eyebrow: "Account security",
      title: "Your verification code",
      intro:
        input.introText || "Use the one-time passcode below to continue securely.",
      code: input.otp,
      expiresInText,
      note: "If you did not request this code, you can safely ignore this email.",
    }),
  });
};

export async function sendRegisterOtpMail(
  email: string,
  otp: string,
) {
  return sendOtpMail({
    to: email,
    otp,
    subject: "Verify your registration",
    introText: "Use this OTP to finish creating your account",
  });
}