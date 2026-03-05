import { v2 as cloudinary } from "cloudinary";

/**
 * Extracts the public ID from a Cloudinary URL and deletes it from storage.
 * @param url The full Cloudinary secure URL (e.g. https://res.cloudinary.com/...)
 */
export async function deleteFromCloudinary(url: string | null | undefined) {
  if (!url || !url.includes("res.cloudinary.com")) return;

  try {
    // Reconfigure explicitly to be safe in serverless environments
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Example: https://res.cloudinary.com/cloud_name/video/upload/v1234567890/sdv/home/filename.mp4
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return;

    // Everything after upload/v<version>/ is the public ID
    // parts[uploadIndex + 1] is the v<version>
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join("/");
    
    // Remove the file extension to get the raw public_id
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "");

    // Determine resource type since Cloudinary requires it for deletion
    const resourceType = url.includes("/video/") ? "video" : "image";

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`Deleted Cloudinary asset: ${publicId} (${resourceType}) - Result:`, result);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }
}
