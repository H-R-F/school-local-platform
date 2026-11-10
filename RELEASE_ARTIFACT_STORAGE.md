# Release artifact storage integration

## Current implementation boundary

The Releases UI now has a Cloudflare R2 upload/download client contract. The repository is currently a Vite React frontend and does not yet contain the authenticated release API. Until the API routes below are implemented and deployed, uploads and downloads intentionally return an API-not-deployed error. The UI must not simulate a successful R2 upload.

## Storage architecture

1. An authenticated Central Platform operator selects a package in the Releases form.
2. The browser requests a short-lived upload URL from the platform backend.
3. The backend authenticates the operator, validates release permissions and metadata, generates a unique object key, and signs a PUT URL for the private R2 bucket.
4. The browser uploads the file directly to R2. The R2 secret access key never reaches the browser.
5. The browser calls the completion endpoint.
6. The backend checks the object exists, verifies its actual size, computes SHA-256 from the stored object, verifies the package signature against the trusted release-signing public key, and persists release metadata.
7. The backend returns the verified object key, checksum and signature state.
8. School Update Agents receive short-lived download URLs only after the central update policy authorizes that school and release.

## Required API contract

All endpoints must require an authenticated Central Platform session and a role/permission such as **release:write**. Apply CSRF protection or strict Origin checks for cookie-authenticated mutations, rate limits, audit logging and request-size limits. Do not expose these endpoints to unauthenticated users.

### POST /api/platform/releases/upload-url

Request:

~~~json
{
  "releaseId": "REL-12345",
  "version": "2.9.0",
  "fileName": "school-platform-2.9.0-linux-amd64.tar.gz",
  "contentType": "application/gzip",
  "size": 201326592
}
~~~

Response:

~~~json
{
  "uploadUrl": "https://<r2-signed-put-url>",
  "objectKey": "releases/2.9.0/<server-generated-id>/package.tar.gz",
  "headers": {
    "Content-Type": "application/gzip"
  }
}
~~~

The backend must generate the object key. Never accept an arbitrary object key from the browser. Keep the URL lifetime short (for example, five minutes).

### Browser upload

The frontend sends a **PUT** request directly to **uploadUrl** with the file body and exactly the signed headers returned by the API. Configure the R2 bucket CORS policy for the Central Platform's exact production origin, **PUT**, required headers, and expose **ETag** if the completion handler uses it.

### POST /api/platform/releases/complete

Request:

~~~json
{
  "releaseId": "REL-12345",
  "version": "2.9.0",
  "objectKey": "releases/2.9.0/<server-generated-id>/package.tar.gz",
  "fileName": "school-platform-2.9.0-linux-amd64.tar.gz",
  "contentType": "application/gzip",
  "size": 201326592,
  "etag": "<r2-etag>"
}
~~~

Response:

~~~json
{
  "objectKey": "releases/2.9.0/<server-generated-id>/package.tar.gz",
  "checksum": "<64-character-sha256-hex>",
  "signatureStatus": "Pending"
}
~~~

The backend must verify object ownership and metadata, independently inspect the R2 object, compute SHA-256, and verify the detached signature. Do not treat the R2 ETag as a SHA-256 checksum. Do not trust a checksum supplied by the browser. Return **Verified** only after cryptographic verification succeeds; otherwise keep the artifact pending or reject it.

The completion endpoint should persist the artifact metadata against the release record in the central database. The frontend's other release metadata persistence is still demo/local state and must be connected to the same backend before production use.

### POST /api/platform/releases/download-url

Request:

~~~json
{
  "objectKey": "releases/2.9.0/<server-generated-id>/package.tar.gz"
}
~~~

Response:

~~~json
{
  "downloadUrl": "https://<r2-signed-get-url>"
}
~~~

The backend must verify the caller's permissions and that the object key belongs to a published release that the caller is allowed to access. Prefer short-lived URLs. School Update Agents should use their own machine identity and update authorization, not a human operator's browser session.

## Backend environment variables

Configure these only in the backend deployment's secret environment:

- **R2_ACCOUNT_ID**
- **R2_ACCESS_KEY_ID**
- **R2_SECRET_ACCESS_KEY**
- **R2_BUCKET_NAME**
- **R2_S3_ENDPOINT** (the account's S3-compatible endpoint)
- **RELEASE_SIGNING_PUBLIC_KEY** (or a managed key reference)

Never use **VITE_** prefixes for secrets. Vite variables are exposed to browser code.

## Production checks before enabling Publish

- Private R2 bucket; no public read access.
- Authenticated operator and release-write permission.
- Strict file type and maximum-size validation on the backend.
- Unique server-generated object keys; prevent overwrite of published artifacts.
- Short-lived presigned URLs.
- Independent object existence and size checks after upload.
- SHA-256 computed from the stored bytes.
- Cryptographic signature verification using a trusted public key.
- Release metadata persisted transactionally in the central database.
- Audit events for upload, verification, publication, deprecation and download authorization.
- R2 lifecycle/retention policy and monitoring for abandoned incomplete uploads.
