export type ReleaseUploadResult = {
  objectKey: string;
  checksum?: string;
  signatureStatus?: "Verified" | "Pending";
};

type UploadRequest = {
  file: File;
  releaseId: string;
  version: string;
};

async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({})) as { error?: string; message?: string };
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("The secure R2 upload API is not deployed yet. Configure the platform backend endpoints first.");
    }
    throw new Error(payload.error || payload.message || ("Release API request failed (" + response.status + ")."));
  }
  return payload as T;
}

/**
 * Uploads a release artifact directly to private R2 using a short-lived,
 * server-issued presigned URL. R2 credentials must never reach the browser.
 */
export async function uploadReleaseArtifact({ file, releaseId, version }: UploadRequest): Promise<ReleaseUploadResult> {
  const request = await fetch("/api/platform/releases/upload-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      releaseId,
      version,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    }),
  });
  const upload = await readApiResponse<{
    uploadUrl: string;
    objectKey: string;
    headers?: Record<string, string>;
  }>(request);

  const put = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: upload.headers || { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) throw new Error("R2 rejected the package upload (" + put.status + ").");

  const complete = await fetch("/api/platform/releases/complete", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      releaseId,
      version,
      objectKey: upload.objectKey,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      etag: put.headers.get("ETag"),
    }),
  });
  return readApiResponse<ReleaseUploadResult>(complete);
}

/** Ask the authenticated backend for a short-lived download URL. */
export async function getReleaseDownloadUrl(objectKey: string): Promise<string> {
  const response = await fetch("/api/platform/releases/download-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ objectKey }),
  });
  const result = await readApiResponse<{ downloadUrl: string }>(response);
  return result.downloadUrl;
}
