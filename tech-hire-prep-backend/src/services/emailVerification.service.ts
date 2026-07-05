import { Types } from "mongoose";
import { AppError } from "../utils/appError.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { sendMail } from "./mail.service.ts";
import { buildActionEmailTemplate, getEmailAppUrl, getEmailBrandName } from "../utils/emailTemplate.ts";
import { generateOpaqueToken, sha256 } from "../utils/security.ts";
import { ENV } from "../config/envConfig.ts";
import { VerificationRepo } from "../repositories/verification.repository.ts";
import { TokenPurpose } from "../types/token.types.ts";

export const requestEmailVerificationService = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid userId", 400);
  }

  const user = await UserRepository.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.emailVerifiedAt) {
    return { message: "Email already verified" };
  }

  await sendVerificationEmail({
    userId: user._id.toString(),
    email: user.email,
    purpose: TokenPurpose.EMAIL_VERIFICATION,
    subject: "Verify your account",
    introText: "Verify your account",
  });

  return { message: "Verification email sent" };
};


export const sendVerificationEmail = async (input: {
  userId: string;
  email: string;
  purpose: TokenPurpose;
  subject: string;
  introText: string;
  pendingName?: string;
  pendingEmail?: string;
  pendingPasswordHash?: string;
}) => {
  const brandName = getEmailBrandName();
  const rawToken = generateOpaqueToken(24);

  await VerificationRepo.deleteActive({
    userId: input.userId,
    purpose: input.purpose
  });

  await VerificationRepo.create({
    userId: new Types.ObjectId(input.userId),
    codeHash: sha256(rawToken),
    expiresAt: new Date(Date.now() + ENV.EMAIL_LINK_TTL_MINUTES * 60 * 1000),
    purpose: input.purpose
  });

  const targetPath =
    input.purpose === "PASSWORD_RESET" ? "/reset-password" : "/verify-email";

  const verificationUrl = `${getEmailAppUrl(targetPath)}?userId=${input.userId}&token=${rawToken}`;

  const templateByPurpose = {
    EMAIL_VERIFICATION: {
      eyebrow: "Email verification",
      title: "Verify your email address",
      actionLabel: "Verify email",
      opensLabel: "Verification page",
      note: "If you did not create this account, ignore this email.",
    },
    ACCOUNT_UPDATE: {
      eyebrow: "Account security",
      title: "Approve your account changes",
      actionLabel: "Approve changes",
      opensLabel: "Verification page",
      note: "If you did not request changes, reset password.",
    },
    PASSWORD_RESET: {
      eyebrow: "Password reset",
      title: "Create a new password",
      actionLabel: "Reset password",
      opensLabel: "Password reset page",
      note: "If not requested, ignore this email.",
    },
  } as const;

  const emailTemplate = templateByPurpose[input.purpose];

  await sendMail({
    to: input.email,
    subject: input.subject || `${emailTemplate.title} - ${brandName}`,
    text: [
      `${emailTemplate.title} - ${brandName}`,
      "",
      input.introText || "Use the secure link below to continue.",
      "",
      verificationUrl,
      "",
      `This link expires in ${ENV.EMAIL_LINK_TTL_MINUTES} minutes.`,
      "",
      emailTemplate.note,
      "",
      getEmailAppUrl(),
    ].join("\n"),
    html: buildActionEmailTemplate({
      preheader: `${emailTemplate.title} with a secure link from ${brandName}.`,
      eyebrow: emailTemplate.eyebrow,
      title: emailTemplate.title,
      intro: input.introText || "Use the secure link below to continue.",
      details: [
        { label: "Link expires in", value: `${ENV.EMAIL_LINK_TTL_MINUTES} minutes` },
        { label: "Opens", value: emailTemplate.opensLabel },
      ],
      action: {
        label: emailTemplate.actionLabel,
        href: verificationUrl,
      },
      note: emailTemplate.note,
    }),
  });
};