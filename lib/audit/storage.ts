import { put } from "@vercel/blob";

export async function uploadAuditFile(
  file: File | Buffer,
  fileName: string
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN not configured");
  }

  const timestamp = Date.now();
  const uniqueFileName = `audits/${timestamp}-${fileName}`;

  const blob = await put(uniqueFileName, file, {
    access: "public",
  });

  return blob.url;
}
