import React, { useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Paperclip, Loader2 } from 'lucide-react';

interface UploadedFile {
  fileId: string;
  filename: string;
}

interface FileUploaderProps {
  onUploadComplete: (files: UploadedFile[]) => void;
  disabled: boolean;
  sessionId?: string;
  existingFileCount: number;
}

const MAX_SESSION_FILES = 5;

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, disabled, sessionId, existingFileCount }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const remainingSlots = MAX_SESSION_FILES - existingFileCount;
    if (files.length > remainingSlots) {
        alert(`You can only upload ${remainingSlots} more file(s) in this session.`);
        if(fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data && response.data.files) {
        onUploadComplete(response.data.files);
      }
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const message = axiosError.response?.data?.message || 'An unknown error occurred.';
        alert(`Upload failed: ${message}`);
        console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const remainingSlots = MAX_SESSION_FILES - existingFileCount;

  return (
    <>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.txt,.md"
        disabled={isUploading || disabled}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isUploading || disabled}
        title={disabled ? `Maximum ${MAX_SESSION_FILES} files per session reached` : `Attach files (${remainingSlots} slots remaining)`}
      >
        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
      </button>
    </>
  );
};

export default FileUploader;
