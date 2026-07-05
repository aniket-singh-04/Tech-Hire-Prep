import { Types } from "mongoose";
import { AppError } from "../utils/appError.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { sendMail } from "./mail.service.ts";
import { buildActionEmailTemplate, getEmailAppUrl, getEmailBrandName } from "../utils/emailTemplate.ts";
import { generateOpaqueToken, sha256 } from "../utils/security.ts";
import { ENV } from "../config/envConfig.ts";
import { VerificationRepo } from "../repositories/verification.repository.ts";
import { VerificationPurpose } from "../types/emailverify.type.ts";

export const requestEmailVerificationService = async (input: { userId: string, purpose: VerificationPurpose }) => {
  if (!Types.ObjectId.isValid(input.userId)) {
    throw new AppError("Invalid userId", 400);
  }

  const user = await UserRepository.findById(input.userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.emailVerifiedAt) {
    return { message: "Email already verified" };
  }

  await sendVerificationEmail({
    userId: user._id.toString(),
    email: user.email,
    purpose: input.purpose
  });

  return { message: "Verification email sent" };
};


export const sendVerificationEmail = async (input: { userId: string; email: string; purpose: VerificationPurpose; }) => {
  const brandName = getEmailBrandName();
  const rawToken = generateOpaqueToken(24);

  await VerificationRepo.deleteActive({
    userId: input.userId,
    purpose: input.purpose,
  });

  await VerificationRepo.create({
    userId: new Types.ObjectId(input.userId),
    codeHash: sha256(rawToken),
    expiresAt: new Date(
      Date.now() + ENV.EMAIL_LINK_TTL_MINUTES * 60 * 1000,
    ),
    purpose: input.purpose,
  });

  let subject: string;
  let intro: string;
  let title: string;
  let eyebrow: string;
  let actionLabel: string;
  let opensLabel: string;
  let note: string;
  let targetPath: string;

  switch (input.purpose) {
    case VerificationPurpose.EMAIL_VERIFICATION:
      subject = `Verify your email - ${brandName}`;
      intro = "Click the button below to verify your email address.";
      title = "Verify your email address";
      eyebrow = "Email Verification";
      actionLabel = "Verify Email";
      opensLabel = "Verification page";
      note = "If you didn't create this account, you can safely ignore this email.";
      targetPath = "/verify-email";
      break;

    case VerificationPurpose.FORGOT_PASSWORD:
      subject = `Reset your password - ${brandName}`;
      intro = "Click the button below to reset your password.";
      title = "Reset your password";
      eyebrow = "Password Reset";
      actionLabel = "Reset Password";
      opensLabel = "Password reset page";
      note = "If you didn't request a password reset, you can safely ignore this email.";
      targetPath = "/reset-password";
      break;

    default:
      throw new AppError("Invalid verification purpose", 400);
  }

  const verificationUrl = `${getEmailAppUrl(targetPath)}?userId=${input.userId}&token=${rawToken}`;

  await sendMail({
    to: input.email,
    subject,

    text: [
      title,
      "",
      intro,
      "",
      verificationUrl,
      "",
      `This link expires in ${ENV.EMAIL_LINK_TTL_MINUTES} minutes.`,
      "",
      note,
      "",
      getEmailAppUrl(),
    ].join("\n"),

    html: buildActionEmailTemplate({
      preheader: `${title} - ${brandName}`,
      eyebrow,
      title,
      intro,
      details: [
        {
          label: "Link expires in",
          value: `${ENV.EMAIL_LINK_TTL_MINUTES} minutes`,
        },
        {
          label: "Opens",
          value: opensLabel,
        },
      ],
      action: {
        label: actionLabel,
        href: verificationUrl,
      },
      note,
    }),
  });
};