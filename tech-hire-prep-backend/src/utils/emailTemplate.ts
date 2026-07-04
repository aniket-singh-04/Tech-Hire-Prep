import { ENV } from "../config/envConfig.ts";

type EmailAction = {
  label: string;
  href: string;
};

type EmailDetail = {
  label: string;
  value?: string;
  valueHtml?: string;
};

type EmailShellInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  contentHtml: string;
  footerNote?: string;
};

type OtpEmailTemplateInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  code: string;
  expiresInText: string;
  note?: string;
  footerNote?: string;
};

type ActionEmailTemplateInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  body?: string[];
  details?: EmailDetail[];
  action: EmailAction;
  note?: string;
  footerNote?: string;
};

type NotificationEmailTemplateInput = {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  details?: EmailDetail[];
  messageTitle?: string;
  message: string;
  action?: EmailAction;
  note?: string;
  footerNote?: string;
};

const DEFAULT_BRAND_NAME = "Tech Hire Prep";
const FALLBACK_PUBLIC_URL = "https://techhireprep.com";
const FONT_STACK = "'Segoe UI', Arial, Helvetica, sans-serif";

const toDisplayName = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();

export const getEmailBrandName = () => {
  const configuredName = ENV.APP_NAME.trim();
  if (!configuredName || configuredName === "tech-hire-prep") {
    return DEFAULT_BRAND_NAME;
  }

  return toDisplayName(configuredName);
};

export const getEmailAppUrl = (path = "") => {
  const normalizedPath = path
    ? path.startsWith("/")
      ? path
      : `/${path}`
    : "";

  try {
    return new URL(normalizedPath, ENV.APP_BASE_URL).toString();
  } catch {
    return `${FALLBACK_PUBLIC_URL}${normalizedPath}`;
  }
};

const getEmailFooterLabel = () => {
  try {
    return new URL(getEmailAppUrl()).host;
  } catch {
    return FALLBACK_PUBLIC_URL.replace(/^https?:\/\//, "");
  }
};

export const escapeEmailHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderCard = (
  contentHtml: string,
  options?: {
    background?: string;
    borderColor?: string;
    padding?: string;
  },
) => `
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      margin-top: 24px;
      background: ${options?.background ?? "#F8FAFC"};
      border: 1px solid ${options?.borderColor ?? "#D9E2EC"};
      border-radius: 22px;
    "
  >
    <tr>
      <td style="padding: ${options?.padding ?? "22px"};">
        ${contentHtml}
      </td>
    </tr>
  </table>
`;

const renderParagraphs = (paragraphs: string[] = []) =>
  paragraphs
    .filter((paragraph) => paragraph.trim().length > 0)
    .map(
      (paragraph) => `
        <p style="margin: 18px 0 0; font-size: 15px; line-height: 1.8; color: #4E5D6C;">
          ${escapeEmailHtml(paragraph)}
        </p>
      `,
    )
    .join("");

const renderDetails = (details: EmailDetail[] = []) => {
  const filteredDetails = details.filter(
    (detail) => detail.valueHtml !== undefined || detail.value !== undefined,
  );

  if (!filteredDetails.length) {
    return "";
  }

  const rows = filteredDetails
    .map((detail, index) => {
      const valueHtml =
        detail.valueHtml !== undefined
          ? detail.valueHtml
          : escapeEmailHtml(detail.value ?? "");
      const paddingTop = index === 0 ? "0" : "16px";
      const divider =
        index < filteredDetails.length - 1
          ? `
            <tr>
              <td colspan="2" style="padding-top: 16px; border-bottom: 1px solid #E4E7EC;"></td>
            </tr>
          `
          : "";

      return `
        <tr>
          <td
            style="
              width: 40%;
              padding-top: ${paddingTop};
              vertical-align: top;
              font-size: 13px;
              line-height: 1.6;
              letter-spacing: 0.3px;
              text-transform: uppercase;
              color: #7B8794;
              font-weight: 700;
            "
          >
            ${escapeEmailHtml(detail.label)}
          </td>
          <td
            style="
              padding-top: ${paddingTop};
              text-align: right;
              vertical-align: top;
              font-size: 14px;
              line-height: 1.7;
              color: #172033;
              font-weight: 600;
            "
          >
            ${valueHtml}
          </td>
        </tr>
        ${divider}
      `;
    })
    .join("");

  return renderCard(
    `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        ${rows}
      </table>
    `,
    {
      background: "#FFFFFF",
      borderColor: "#E4E7EC",
    },
  );
};

const renderButton = (action: EmailAction) => `
  <table
    role="presentation"
    class="email-button"
    cellspacing="0"
    cellpadding="0"
    border="0"
    align="center"
    style="margin: 28px auto 0;"
  >
    <tr>
      <td align="center" bgcolor="#C7692B" style="border-radius: 14px;">
        <a
          href="${escapeEmailHtml(action.href)}"
          style="
            display: inline-block;
            padding: 15px 28px;
            font-family: ${FONT_STACK};
            font-size: 15px;
            line-height: 1;
            font-weight: 700;
            color: #FFFFFF;
            text-decoration: none;
          "
        >
          ${escapeEmailHtml(action.label)}
        </a>
      </td>
    </tr>
  </table>
`;

const renderFallbackLink = (action: EmailAction) => `
  <p style="margin: 18px 0 0; font-size: 13px; line-height: 1.7; color: #5F6C7B;">
    If the button does not work, copy and paste this secure link into your browser:
  </p>
  <div
    style="
      margin-top: 12px;
      padding: 14px 16px;
      border-radius: 18px;
      border: 1px solid #D9E2EC;
      background: #F8FAFC;
      font-size: 13px;
      line-height: 1.7;
      word-break: break-all;
    "
  >
    <a
      href="${escapeEmailHtml(action.href)}"
      style="color: #26435F; text-decoration: none;"
    >
      ${escapeEmailHtml(action.href)}
    </a>
  </div>
`;

const renderNote = (note?: string) => {
  if (!note) {
    return "";
  }

  return `
    <div
      style="
        margin-top: 24px;
        padding: 15px 16px;
        border-left: 4px solid #C7692B;
        border-radius: 16px;
        background: #FFF7EF;
      "
    >
      <p style="margin: 0; font-size: 13px; line-height: 1.8; color: #654633;">
        ${escapeEmailHtml(note)}
      </p>
    </div>
  `;
};

const renderMessageCard = (title: string, message: string) =>
  renderCard(
    `
      <p
        style="
          margin: 0 0 10px;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 700;
          color: #8C6B4F;
        "
      >
        ${escapeEmailHtml(title)}
      </p>
      <div style="margin: 0; font-size: 15px; line-height: 1.8; color: #223045;">
        ${escapeEmailHtml(message).replace(/\r?\n/g, "<br />")}
      </div>
    `,
    {
      background: "#FFF8F1",
      borderColor: "#F2D3B7",
    },
  );

const buildEmailShell = (input: EmailShellInput) => {
  const brandName = getEmailBrandName();
  const footerUrl = getEmailAppUrl();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeEmailHtml(input.title)}</title>
    <style>
      @media screen and (max-width: 620px) {
        .email-shell {
          width: 100% !important;
        }

        .email-padding {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }

        .email-section {
          padding: 24px 20px !important;
        }

        .email-button,
        .email-button td,
        .email-button a {
          width: 100% !important;
          display: block !important;
          box-sizing: border-box !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background: #F3EDE6;">
    <div
      style="
        display: none;
        overflow: hidden;
        max-height: 0;
        max-width: 0;
        opacity: 0;
        line-height: 1px;
      "
    >
      ${escapeEmailHtml(input.preheader)}
    </div>
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background: #F3EDE6;"
    >
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table
            role="presentation"
            width="100%"
            class="email-shell"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="max-width: 640px; width: 100%;"
          >
            <tr>
              <td
                style="
                  padding: 0 0 14px;
                  text-align: center;
                  font-family: ${FONT_STACK};
                  font-size: 12px;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  color: #8C6B4F;
                "
              >
                ${escapeEmailHtml(brandName)}
              </td>
            </tr>
            <tr>
              <td class="email-padding" style="padding: 0 24px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="background: linear-gradient(135deg, #172033 0%, #26435F 100%); border-radius: 28px 28px 0 0;"
                >
                  <tr>
                    <td class="email-section" style="padding: 36px 36px 28px; font-family: ${FONT_STACK};">
                      <div
                        style="
                          display: inline-block;
                          margin-bottom: 16px;
                          padding: 8px 14px;
                          border-radius: 999px;
                          background: rgba(255, 255, 255, 0.14);
                          font-size: 12px;
                          font-weight: 700;
                          letter-spacing: 1px;
                          text-transform: uppercase;
                          color: #FFFFFF;
                        "
                      >
                        ${escapeEmailHtml(input.eyebrow)}
                      </div>
                      <h1
                        style="
                          margin: 0 0 14px;
                          font-size: 30px;
                          line-height: 1.2;
                          font-weight: 700;
                          color: #FFFFFF;
                        "
                      >
                        ${escapeEmailHtml(input.title)}
                      </h1>
                      <p
                        style="
                          margin: 0;
                          font-size: 16px;
                          line-height: 1.75;
                          color: rgba(255, 255, 255, 0.86);
                        "
                      >
                        ${escapeEmailHtml(input.intro)}
                      </p>
                    </td>
                  </tr>
                </table>
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="background: #FFFFFF; border-radius: 0 0 28px 28px; box-shadow: 0 18px 45px rgba(18, 34, 54, 0.1);"
                >
                  <tr>
                    <td class="email-section" style="padding: 32px 36px 36px; font-family: ${FONT_STACK}; color: #223045;">
                      ${input.contentHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding: 18px 20px 0;
                  text-align: center;
                  font-family: ${FONT_STACK};
                  font-size: 12px;
                  line-height: 1.7;
                  color: #7E6B57;
                "
              >
                <p style="margin: 0 0 6px;">
                  ${escapeEmailHtml(input.footerNote ?? `This message was sent by ${brandName}.`)}
                </p>
                <p style="margin: 0;">
                  <a href="${escapeEmailHtml(footerUrl)}" style="color: #8C6B4F; text-decoration: none;">
                    ${escapeEmailHtml(getEmailFooterLabel())}
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const buildOtpEmailTemplate = (input: OtpEmailTemplateInput) => {
  const brandName = getEmailBrandName();

  return buildEmailShell({
    preheader: input.preheader,
    eyebrow: input.eyebrow,
    title: input.title,
    intro: input.intro,
    footerNote: input.footerNote,
    contentHtml: `
      ${renderCard(
        `
          <p
            style="
              margin: 0;
              text-align: center;
              font-size: 12px;
              letter-spacing: 1px;
              text-transform: uppercase;
              font-weight: 700;
              color: #8C6B4F;
            "
          >
            One-time passcode
          </p>
          <p
            style="
              margin: 18px 0 0;
              text-align: center;
              font-size: 34px;
              line-height: 1;
              letter-spacing: 10px;
              font-weight: 700;
              color: #172033;
              font-variant-numeric: tabular-nums;
            "
          >
            ${escapeEmailHtml(input.code)}
          </p>
          <p
            style="
              margin: 16px 0 0;
              text-align: center;
              font-size: 13px;
              line-height: 1.7;
              color: #6B7280;
            "
          >
            Enter this code in ${escapeEmailHtml(brandName)} to continue securely.
          </p>
        `,
        {
          background: "#FFF8F1",
          borderColor: "#F2D3B7",
          padding: "24px",
        },
      )}
      ${renderDetails([
        { label: "Expires in", value: input.expiresInText },
        { label: "Security", value: "Never share this code with anyone." },
      ])}
      ${renderNote(input.note)}
    `,
  });
};

export const buildActionEmailTemplate = (input: ActionEmailTemplateInput) =>
  buildEmailShell({
    preheader: input.preheader,
    eyebrow: input.eyebrow,
    title: input.title,
    intro: input.intro,
    footerNote: input.footerNote,
    contentHtml: `
      ${renderParagraphs(input.body)}
      ${renderDetails(input.details)}
      ${renderButton(input.action)}
      ${renderFallbackLink(input.action)}
      ${renderNote(input.note)}
    `,
  });

export const buildNotificationEmailTemplate = (
  input: NotificationEmailTemplateInput,
) =>
  buildEmailShell({
    preheader: input.preheader,
    eyebrow: input.eyebrow,
    title: input.title,
    intro: input.intro,
    footerNote: input.footerNote,
    contentHtml: `
      ${renderDetails(input.details)}
      ${renderMessageCard(input.messageTitle ?? "Message", input.message)}
      ${input.action ? renderButton(input.action) : ""}
      ${input.note ? renderNote(input.note) : ""}
    `,
  });
