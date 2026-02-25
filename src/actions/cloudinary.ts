"use server";

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload any file (PDF, image, doc, etc.) for task attachments
export async function uploadTaskAttachment(
  base64File: string,
  fileName: string
): Promise<string> {
  const publicId = `task_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}`;
  const result = await cloudinary.uploader.upload(base64File, {
    folder: "hr-office/task-attachments",
    public_id: publicId,
    resource_type: "auto", // auto-detect: image, video, raw (pdf, doc, etc.)
    overwrite: false,
  });
  return result.secure_url;
}

export async function uploadAvatarToCloudinary(
  base64Image: string,
  userId: string
): Promise<string> {
  console.log("☁️ Cloudinary signed upload starting...");
  console.log("👤 User ID:", userId);

  try {
    console.log("📤 Uploading to Cloudinary with SDK...");
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'hr-office/avatars',
      public_id: userId,
      overwrite: true,
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    console.log("✅ Upload successful!");
    console.log("🔗 URL:", result.secure_url);
    
    return result.secure_url;
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw new Error(error instanceof Error ? error.message : "Upload failed");
  }
}
