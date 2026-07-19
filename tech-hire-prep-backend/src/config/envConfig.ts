import dotenv from "dotenv";

dotenv.config();

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const getString = (
    key: string,
    defaultValue?: string,
): string => {
    const value = process.env[key] ?? defaultValue;

    if (value === undefined) {
        throw new Error(`Missing environment variable: ${key}`);
    }

    return value.trim();
};

const getNumber = (
    key: string,
    defaultValue?: number,
): number => {
    const raw = process.env[key];

    if (raw === undefined || raw.trim() === "") {
        if (defaultValue !== undefined) {
            return defaultValue;
        }

        throw new Error(`Missing environment variable: ${key}`);
    }

    const value = Number(raw);

    if (!Number.isFinite(value)) {
        throw new Error(`Environment variable "${key}" must be a valid number.`);
    }

    return value;
};

const getBoolean = (
    key: string,
    defaultValue = false,
): boolean => {
    const raw = process.env[key];

    if (raw === undefined || raw.trim() === "") {
        return defaultValue;
    }

    return ["true", "1", "yes", "on"].includes(
        raw.trim().toLowerCase(),
    );
};

const getArray = (
    key: string,
    defaultValue: string[] = [],
): string[] => {
    const raw = process.env[key];

    if (!raw) {
        return defaultValue;
    }

    return raw
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
};

const getUrl = (
    key: string,
    defaultValue?: string,
): string => {
    const value = getString(key, defaultValue);

    try {
        new URL(value);
    } catch {
        throw new Error(`${key} must be a valid URL.`);
    }

    return value;
};

const getOptional = (key: string): string => {
    return (process.env[key] ?? "").trim();
};

/* -------------------------------------------------------------------------- */
/*                              Razorpay Helpers                              */
/* -------------------------------------------------------------------------- */

const resolveRazorpayKeyId = () => {
    const keyId = getOptional("RAZORPAY_KEY_ID");
    const legacy = getOptional("RAZORPAY_KEY");

    if (keyId && legacy && keyId !== legacy) {
        console.warn(
            "RAZORPAY_KEY_ID and RAZORPAY_KEY differ. Using RAZORPAY_KEY_ID.",
        );
    }

    return keyId || legacy;
};

const resolveRazorpaySecret = () => {
    const secret = getOptional("RAZORPAY_KEY_SECRET");
    const legacy = getOptional("RAZORPAY_SECRET");

    if (secret && legacy && secret !== legacy) {
        console.warn(
            "RAZORPAY_KEY_SECRET and RAZORPAY_SECRET differ. Using RAZORPAY_KEY_SECRET.",
        );
    }

    return secret || legacy;
};

const RAZORPAY_KEY_ID = resolveRazorpayKeyId();
const RAZORPAY_KEY_SECRET = resolveRazorpaySecret();

/* -------------------------------------------------------------------------- */
/*                                Environment                                 */
/* -------------------------------------------------------------------------- */

export const ENV = Object.freeze({
    NODE_ENV: getString(
        "NODE_ENV",
        "development",
    ) as "development" | "production" | "test",

    PORT: getNumber("PORT", 4400),

    APP_NAME: getString(
        "APP_NAME",
        "Tech-Hire-Prep",
    ),

    APP_BASE_URL: getUrl(
        "APP_BASE_URL",
        "http://localhost:5173",
    ),

    APP_RUNTIME: getString(
        "APP_RUNTIME",
        process.env.AWS_LAMBDA_FUNCTION_NAME ? "lambda" : "ec2",
    ),

    /* ------------------------------ Database ------------------------------ */

    MONGO_URI: getString(
        "MONGO_URI",
        "mongodb://127.0.0.1:27017/tech-hire-prep",
    ),

    REDIS_URL: getString(
        "REDIS_URL",
        "redis://127.0.0.1:6379",
    ),

    /* -------------------------------- CORS ------------------------------- */

    CORS_ORIGINS: getArray(
        "CORS_ORIGIN",
        ["http://localhost:5173"],
    ),

    /* ------------------------------- Security ----------------------------- */

    COOKIE_SECRET: getString(
        "COOKIE_SECRET",
        "development-cookie-secret",
    ),

    JWT_SECRET: getString(
        "JWT_SECRET",
        "development-jwt-secret",
    ),

    JWT_ACCESS_SECRET: getString(
        "JWT_ACCESS_SECRET",
        "development-access-secret",
    ),

    JWT_REFRESH_SECRET: getString(
        "JWT_REFRESH_SECRET",
        "development-refresh-secret",
    ),

    ADMIN_JWT_ACCESS_SECRET: getString(
        "ADMIN_JWT_ACCESS_SECRET",
        "development-admin-access-secret",
    ),

    ADMIN_JWT_REFRESH_SECRET: getString(
        "ADMIN_JWT_REFRESH_SECRET",
        process.env.JWT_REFRESH_SECRET ??
        "development-admin-refresh-secret",
    ),

    JWT_ACCESS_ISSUER: getString(
        "JWT_ACCESS_ISSUER",
        "techhireprep-access",
    ),

    JWT_REFRESH_ISSUER: getString(
        "JWT_REFRESH_ISSUER",
        "techhireprep-refresh",
    ),

    ACCESS_TOKEN_TTL_MINUTES: getNumber(
        "ACCESS_TOKEN_TTL_MINUTES",
        15,
    ),

    REFRESH_TOKEN_TTL_DAYS: getNumber(
        "REFRESH_TOKEN_TTL_DAYS",
        30,
    ),

    OTP_TTL_MINUTES: getNumber(
        "OTP_TTL_MINUTES",
        5,
    ),

    EMAIL_LINK_TTL_MINUTES: getNumber(
        "EMAIL_LINK_TTL_MINUTES",
        30,
    ),

    /* -------------------------------- Mail ------------------------------- */

    SMTP_HOST: getString(
        "SMTP_HOST",
        "",
    ),

    SMTP_PORT: getNumber(
        "SMTP_PORT",
        587,
    ),

    SMTP_USER: getString(
        "SMTP_USER",
        "",
    ),

    SMTP_PASS: getString(
        "SMTP_PASS",
        "",
    ),

    EMAIL_FROM: getString(
        "EMAIL_FROM",
        "no-reply@example.com",
    ),

    PLATFORM_OWNER_EMAIL: getString(
        "PLATFORM_OWNER_EMAIL",
        "",
    ),

    /* -------------------------------- AWS -------------------------------- */

    AWS_REGION: getString(
        "AWS_REGION",
        "ap-south-1",
    ),

    AWS_ACCESS_KEY_ID: getString(
        "AWS_ACCESS_KEY_ID",
        "",
    ),

    AWS_SECRET_ACCESS_KEY: getString(
        "AWS_SECRET_ACCESS_KEY",
        "",
    ),

    S3_PRIVATE_BUCKET: getString(
        "S3_PRIVATE_BUCKET",
        "",
    ),

    /* ----------------------------- Razorpay ------------------------------ */

    RAZORPAY_KEY_ID,

    RAZORPAY_KEY_SECRET,

    RAZORPAY_WEBHOOK_SECRET: getString(
        "RAZORPAY_WEBHOOK_SECRET",
        "",
    ),

    RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET:
        getString(
            "RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET", "",
        ),

    /* ------------------------------- Jobs -------------------------------- */

    ENABLE_BACKGROUND_JOBS: getBoolean(
        "ENABLE_BACKGROUND_JOBS",
        false,
    ),

    PAYMENT_JOB_POLL_INTERVAL_MS: getNumber("PAYMENT_JOB_POLL_INTERVAL_MS", 60000,),

    REFUND_RETRY_DELAY_MS: getNumber(
        "REFUND_RETRY_DELAY_MS",
        60000,
    ),

    /* --------------------------- Subscription ---------------------------- */

    SUBSCRIPTION_TRIAL_DAYS: getNumber(
        "SUBSCRIPTION_TRIAL_DAYS",
        7,
    ),

    SUBSCRIPTION_GRACE_DAYS: getNumber(
        "SUBSCRIPTION_GRACE_DAYS",
        3,
    ),

    SUBSCRIPTION_REMINDER_HOURS: getNumber(
        "SUBSCRIPTION_REMINDER_HOURS",
        48,
    ),

    /* ------------------------------ Platform ----------------------------- */

    PLATFORM_COMMISSION_BPS: getNumber(
        "PLATFORM_COMMISSION_BPS",
        0,
    ),

    /* ------------------------------ Features ----------------------------- */

    ENABLE_SWAGGER: getBoolean(
        "ENABLE_SWAGGER",
        false,
    ),

    ENABLE_EMAILS: getBoolean(
        "ENABLE_EMAILS",
        true,
    ),

    COOKIE_SECURE: getBoolean(
        "COOKIE_SECURE",
        false,
    ),

    /* ------------------------------ webRtc ----------------------------- */
    ICE_MODE: getString(
        "ICE_MODE",
        "public-stun"
    ),
    
    PUBLIC_STUN_URL: getString(
        "PUBLIC_STUN_URL",
        "stun:stun.l.google.com:19302"
    ),

    TURN_ENABLED: getBoolean(
        "TURN_ENABLED", 
        false
    ),
    
    TURN_HOST: getString(
        "TURN_HOST", 
        ""
    ),
    
    TURN_SECRET: getString(
        "TURN_SECRET", 
        ""
    ),
    
    TURN_PORT: getNumber(
        "TURN_PORT", 
        3478
    ),
    
    TURN_TLS_PORT: getNumber(
        "TURN_TLS_PORT", 
        5349
    ),
    
    TURN_TTL: getNumber(
        "TURN_TTL", 
        3600
    ),
    
    /* ------------------------------ webRtc ----------------------------- */

    JUDGE0_URL: getString(
        "JUDGE0_URL",
        "https://judge0-ce.p.rapidapi.com"
    ),

    JUDGE0_KEY: getString(
        "JUDGE0_KEY",
        ""
    ),

    JUDGE0_HOST: getString(
        "JUDGE0_HOST",
        "judge0-ce.p.rapidapi.com"
    )

} as const);

/* -------------------------------------------------------------------------- */
/*                        Production Validation                               */
/* -------------------------------------------------------------------------- */

if (ENV.NODE_ENV === "production") {
    const required = [
        ["MONGO_URI", ENV.MONGO_URI],
        ["JWT_ACCESS_SECRET", ENV.JWT_ACCESS_SECRET],
        ["JWT_REFRESH_SECRET", ENV.JWT_REFRESH_SECRET],
        ["COOKIE_SECRET", ENV.COOKIE_SECRET],
        ["SMTP_HOST", ENV.SMTP_HOST],
        ["SMTP_USER", ENV.SMTP_USER],
        ["SMTP_PASS", ENV.SMTP_PASS],
        ["EMAIL_FROM", ENV.EMAIL_FROM],
    ] as const;

    for (const [key, value] of required) {
        if (!value) {
            throw new Error(`${key} is required in production.`);
        }
    }

    const insecureDefaults = [
        "development-jwt-secret",
        "development-access-secret",
        "development-refresh-secret",
        "development-admin-access-secret",
        "development-admin-refresh-secret",
        "development-cookie-secret",
    ];

    const secrets = [
        ENV.JWT_SECRET,
        ENV.JWT_ACCESS_SECRET,
        ENV.JWT_REFRESH_SECRET,
        ENV.ADMIN_JWT_ACCESS_SECRET,
        ENV.ADMIN_JWT_REFRESH_SECRET,
        ENV.COOKIE_SECRET,
    ];

    for (const secret of secrets) {
        if (insecureDefaults.includes(secret)) {
            throw new Error(
                "Default development secrets cannot be used in production.",
            );
        }
    }

    if (
        !ENV.RAZORPAY_WEBHOOK_SECRET
    ) {
        console.warn(
            "RAZORPAY_WEBHOOK_SECRET is not configured.",
        );
    }

    if (
        !ENV.RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET
    ) {
        console.warn(
            "RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET is not configured.",
        );
    }
}

