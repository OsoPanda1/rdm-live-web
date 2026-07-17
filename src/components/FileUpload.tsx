import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import PrismaticCard from "./PrismaticCard";
import UploadVisualizer from "./UploadVisualizer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { toast } from "sonner";

interface FileUploadProps {
  className?: string;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
  bucket?: string;
  folder?: string;
  onUploadComplete?: (urls: string[]) => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "idle" | "uploading" | "complete" | "error";
  url?: string;
}

const FileUpload = ({
  className,
  maxFiles = 5,
  maxSize = 10,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  bucket = "media",
  folder,
  onUploadComplete,
}: FileUploadProps) => {
  const { user } = useRDMAuth();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList) => {
    if (files.length >= maxFiles) {
      toast.error(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    const newFiles: UploadFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      if (files.length + newFiles.length >= maxFiles) return;
      
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`"${file.name}" excede el límite de ${maxSize}MB`);
        return;
      }
      
      const fileType = file.type || "";
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith("/*")) {
          return fileType.startsWith(type.split("/")[0]);
        }
        return type === fileType;
      });
      
      if (!isAllowed) {
        toast.error(`"${file.name}" tipo de archivo no soportado`);
        return;
      }
      
      newFiles.push({
        id: `${file.name}-${Date.now()}`,
        file,
        progress: 0,
        status: "idle",
      });
    });
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const uploadFiles = async () => {
    if (!files.length || isUploading) return;
    if (!user) {
      toast.error("Debes iniciar sesión para subir archivos");
      return;
    }

    setIsUploading(true);
    setFiles(prev => prev.map(file => 
      file.status === "idle" ? { ...file, status: "uploading" as const } : file
    ));

    const uploadedUrls: string[] = [];
    const userId = user.id;
    const baseFolder = folder || `${userId}`;

    for (const uploadFile of files) {
      if (uploadFile.status !== "idle" && uploadFile.status !== "uploading") continue;

      const ext = uploadFile.file.name.split(".").pop();
      const fileName = `${baseFolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, uploadFile.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        toast.error(`Error al subir ${uploadFile.file.name}: ${error.message}`);
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, progress: 0, status: "error" as const } : f
        ));
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, progress: 100, status: "complete" as const, url: publicUrl } : f
      ));

      uploadedUrls.push(publicUrl);
    }

    setIsUploading(false);

    if (uploadedUrls.length > 0) {
      toast.success(`${uploadedUrls.length} archivo(s) subido(s) correctamente`);
      onUploadComplete?.(uploadedUrls);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <PrismaticCard
        variant="quantum"
        className={cn(
          "h-40 flex flex-col items-center justify-center transition-all duration-300",
          isDragging ? "border-quantum-300 shadow-prismatic" : "",
          isUploading ? "opacity-50 pointer-events-none" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={cn(
          "flex flex-col items-center justify-center text-center transition-transform duration-300",
          isDragging ? "scale-105" : ""
        )}>
          <div className="h-12 w-12 rounded-full bg-quantum-300/10 flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-quantum-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="font-medium mb-1">Quantum Data Integration</h3>
          <p className="text-sm text-muted-foreground">
            {isDragging ? "Release to upload" : "Drag files or click to browse"}
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
        />
      </PrismaticCard>

      {/* File list */}
      {files.length > 0 && (
        <PrismaticCard className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Neural Integration Matrix</h3>
            <span className="text-xs text-muted-foreground">
              {files.length} / {maxFiles} files
            </span>
          </div>
          
          <div className="space-y-3">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="relative"
              >
                <UploadVisualizer
                  progress={file.progress}
                  fileName={file.file.name}
                  fileSize={formatFileSize(file.file.size)}
                  status={file.status}
                  className="crystal-glow"
                />
                {file.status !== "uploading" && (
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="mr-2 border-muted hover:bg-muted"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              className="bg-gradient-prismatic hover:opacity-90 text-primary-foreground"
              onClick={uploadFiles}
              disabled={isUploading || !user || files.every(f => f.status !== "idle")}
            >
              {isUploading ? "Subiendo..." : "Subir a Supabase Storage"}
            </Button>
          </div>
        </PrismaticCard>
      )}
    </div>
  );
};

export default FileUpload;
