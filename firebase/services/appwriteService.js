import { Client, Storage, ID } from "appwrite";

// Initialize Appwrite client (singleton)
const client = new Client();

function cleanEnv(v) {
    if (!v || typeof v !== "string") return "";
    let s = v.trim();
    // remove surrounding single or double quotes
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1).trim();
    }
    return s;
}

const endpoint = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || "");
const project = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || "");
const defaultBucketId = cleanEnv(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || process.env.VITE_APPWRITE_BUCKET_ID || process.env.APPWRITE_BUCKET_ID || "");

if (endpoint) client.setEndpoint(endpoint);
if (project) client.setProject(project);

const storage = new Storage(client);

/**
 * Upload a file to Appwrite Storage.
 * options: { bucketId?: string, fileId?: string }
 * Returns: { fileId, file, url }
 */
export async function uploadFile(file, options = {}) {
    if (!file) throw new Error("No file provided");

    const bucketId = options.bucketId || defaultBucketId;
    if (!bucketId) throw new Error("No Appwrite bucket id configured (set NEXT_PUBLIC_APPWRITE_BUCKET_ID or VITE_APPWRITE_BUCKET_ID)");

    const fileId = options.fileId || ID.unique();

    try {
        // createFile — using the object-style call that works with the browser SDK
        const created = await storage.createFile({
            bucketId,
            fileId,
            file,
        });

        // Try to get a downloadable URL for the file
        let url = null;
        try {
            const download = await storage.getFileDownload({ bucketId, fileId: created.$id || fileId });
            // getFileDownload may return a Response or a URL depending on SDK; if it's a string/URL, use it
            url = download;
        } catch (e) {
            // ignore; API may differ — return created metadata and caller can fetch via getFileDownload
            url = null;
        }

        return { fileId: created.$id || fileId, file: created, url };
    } catch (err) {
        console.error("appwrite.uploadFile error", err);
        throw err;
    }
}

export async function getFileDownloadUrl(bucketIdOrOptions, fileId) {
    const bucketId = typeof bucketIdOrOptions === "string" ? bucketIdOrOptions : bucketIdOrOptions?.bucketId || defaultBucketId;
    const fid = typeof bucketIdOrOptions === "string" ? fileId : bucketIdOrOptions?.fileId;
    if (!bucketId) throw new Error("No Appwrite bucket id configured");
    if (!fid) throw new Error("No fileId provided");

    return await storage.getFileDownload({ bucketId, fileId: fid });
}

export default {
    uploadFile,
    getFileDownloadUrl,
};
