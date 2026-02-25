"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { uploadTaskAttachment } from "@/actions/cloudinary";
import { motion, AnimatePresence } from "framer-motion";

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: Id<"users">;
  uploadedAt: number;
}

interface Props {
  taskId: Id<"tasks">;
  attachments: Attachment[];
  currentUserId: Id<"users">;
  canUpload: boolean;
}

const FILE_ICONS: Record<string, string> = {
  "application/pdf": "📄",
  "image/": "🖼️",
  "video/": "🎬",
  "audio/": "🎵",
  "text/": "📝",
  "application/zip": "🗜️",
  "application/x-zip": "🗜️",
  "application/msword": "📃",
  "application/vnd.openxmlformats": "📃",
  "application/vnd.ms-excel": "📊",
  "application/vnd.ms-powerpoint": "📊",
};

function getFileIcon(type: string): string {
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (type.startsWith(key)) return icon;
  }
  return "📎";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachments({ taskId, attachments, currentUserId, canUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addAttachment = useMutation(api.tasks.addAttachment);
  const removeAttachment = useMutation(api.tasks.removeAttachment);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Max 5 files at once, max 10MB each
    const validFiles = files.filter(f => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    }).slice(0, 5);

    if (!validFiles.length) return;
    setUploading(true);

    try {
      await Promise.all(validFiles.map(async (file) => {
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to Cloudinary
        const url = await uploadTaskAttachment(base64, file.name);

        // Save to Convex
        await addAttachment({
          taskId,
          url,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedBy: currentUserId,
        });
      }));
      toast.success(`${validFiles.length} file${validFiles.length > 1 ? "s" : ""} uploaded ✓`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (url: string, name: string) => {
    if (!confirm(`Remove "${name}"?`)) return;
    try {
      await removeAttachment({ taskId, url });
      toast.success("Removed");
      if (preview?.url === url) setPreview(null);
    } catch {
      toast.error("Failed to remove");
    }
  };

  const isImage = (type: string) => type.startsWith("image/");
  const isPdf = (type: string) => type === "application/pdf";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">📎 Attachments</span>
          {attachments.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {attachments.length}
            </span>
          )}
        </div>
        {canUpload && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            {uploading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>+ Attach File</>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Attachment list */}
      {attachments.length === 0 ? (
        <div
          onClick={() => canUpload && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
            canUpload ? "cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30" : ""
          }`}
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-2xl mb-1">📎</p>
          <p className="text-sm text-slate-400">
            {canUpload ? "Click to attach files (PDF, images, docs...)" : "No attachments"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <AnimatePresence>
            {attachments.map((att) => (
              <motion.div
                key={att.url}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative rounded-xl border overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
                onClick={() => setPreview(att)}
              >
                {/* Image thumbnail */}
                {isImage(att.type) ? (
                  <div className="h-20 bg-slate-50 overflow-hidden">
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-4xl bg-slate-50">
                    {getFileIcon(att.type)}
                  </div>
                )}

                {/* File info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-slate-700 truncate" title={att.name}>{att.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(att.size)}</p>
                </div>

                {/* Remove button */}
                {canUpload && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(att.url, att.name); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getFileIcon(preview.type)}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{preview.name}</p>
                    <p className="text-xs text-slate-400">{formatSize(preview.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={preview.url}
                    download={preview.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium px-3 py-1.5 rounded-xl text-white"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    ⬇ Download
                  </a>
                  <button
                    onClick={() => setPreview(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Preview content */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50 min-h-[300px]">
                {isImage(preview.type) ? (
                  <img src={preview.url} alt={preview.name} className="max-w-full max-h-[60vh] object-contain rounded-xl shadow" />
                ) : isPdf(preview.type) ? (
                  <iframe src={preview.url} className="w-full h-[60vh] rounded-xl" title={preview.name} />
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-6xl">{getFileIcon(preview.type)}</p>
                    <p className="text-slate-600 font-medium">{preview.name}</p>
                    <p className="text-slate-400 text-sm">Preview not available for this file type</p>
                    <a
                      href={preview.url}
                      download={preview.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                      ⬇ Download to view
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
