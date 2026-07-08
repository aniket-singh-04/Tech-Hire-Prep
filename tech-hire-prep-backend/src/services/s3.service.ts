import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "../config/envConfig.ts";

const client = new S3Client({
    region: ENV.AWS_REGION,
});

const hasS3Config = Boolean(ENV.S3_PRIVATE_BUCKET);

export const getSignedReadUrl = async (key: string, expiresIn = 300) => {
    if (!hasS3Config) {
        return key;
    }

    return getSignedUrl(
        client,
        new GetObjectCommand({
            Bucket: ENV.S3_PRIVATE_BUCKET,
            Key: key,
        }),
        { expiresIn },
    );
};

export const getSignedUploadUrl = async (input: { key: string; contentType: string; expiresIn?: number; }) => {
    if (!hasS3Config) {
        return {
            uploadUrl: input.key,
            key: input.key,
        };
    }

    const uploadUrl = await getSignedUrl(
        client,
        new PutObjectCommand({
            Bucket: ENV.S3_PRIVATE_BUCKET,
            Key: input.key,
            ContentType: input.contentType,
        }),
        { expiresIn: input.expiresIn ?? 300 },
    );

    return {
        uploadUrl,
        key: input.key,
    };
};

export const deleteStoredObject = async (key: string) => {
    if (!hasS3Config || !key) {
        return;
    }

    await client.send(
        new DeleteObjectCommand({
            Bucket: ENV.S3_PRIVATE_BUCKET,
            Key: key,
        }),
    );
};

export const putPrivateObject = async (input: { key: string; body: Buffer; contentType: string; }) => {
    if (!hasS3Config) {
        return {
            key: input.key,
        };
    }

    await client.send(
        new PutObjectCommand({
            Bucket: ENV.S3_PRIVATE_BUCKET,
            Key: input.key,
            Body: input.body,
            ContentType: input.contentType,
        }),
    );

    return {
        key: input.key,
    };
};
