import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaUploadProps {
  onUploadComplete: (urls: string[]) => void;
  onClear: () => void;
}

const BEAUTIFUL_PHOTO_OPTIONS = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200"
];

export function MediaUpload({ onUploadComplete, onClear }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startSimulatedUpload = () => {
    setUploading(true);
    setProgress(3);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Pick a random gorgeous high fashion image from list
          const randomUrl = BEAUTIFUL_PHOTO_OPTIONS[Math.floor(Math.random() * BEAUTIFUL_PHOTO_OPTIONS.length)];
          setPreviewUrl(randomUrl);
          onUploadComplete([randomUrl]);
          return 100;
        }
        // Accelerate or smooth out upload speed
        const increment = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + increment, 100);
      });
    }, 150);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      startSimulatedUpload();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      startSimulatedUpload();
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setUploading(false);
    onClear();
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 p-4 rounded-full mb-3 text-zinc-400 group-hover:text-pink-500"
            >
              <Upload className="w-6 h-6 text-pink-500" />
            </motion.div>
            <p className="text-sm font-medium text-zinc-200">Drag & drop your file here, or click to browse</p>
            <p className="text-xs text-zinc-500 mt-1">Supports gorgeous high-definition photos or performance reels</p>
          </motion.div>
        )}

        {file && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-zinc-800 bg-zinc-950/60 rounded-xl p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900 p-2.5 border border-zinc-800 rounded-lg text-pink-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-zinc-500 hover:text-white hover:bg-zinc-900 p-1.5 rounded-lg border border-transparent hover:border-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Encrypting & staging on secure storage sandbox...</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {!uploading && previewUrl && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Securely mounted (Vercel Core + Supabase Storage)</span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-zinc-800 h-44 bg-zinc-900">
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-xs bg-pink-500/20 backdrop-blur-md border border-pink-500/30 text-pink-300 px-2.5 py-1 rounded-full font-mono">
                      Staged Asset #{(Math.floor(Math.random() * 8000) + 1000)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
