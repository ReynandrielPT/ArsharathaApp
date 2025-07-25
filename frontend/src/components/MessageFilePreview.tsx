import React from 'react';
import { File as FileIcon } from 'lucide-react';

interface MessageFile {
  filename: string;
}

interface MessageFilePreviewProps {
  files: MessageFile[];
}

const MessageFilePreview: React.FC<MessageFilePreviewProps> = ({ files }) => {
  return (
    <div className="mb-2 group">
      {/* Custom scrollbar styling for this specific component */}
      <style>
        {`
          .file-preview-scrollbar::-webkit-scrollbar {
            height: 4px;
          }
          .file-preview-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .file-preview-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
          }
          .file-preview-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
      <div className="file-preview-scrollbar flex w-full items-center gap-2 overflow-x-auto p-2 -mx-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="
              flex-shrink-0 
              flex items-center gap-2 
              bg-white/60 backdrop-blur-sm 
              border border-slate-200/80
              text-slate-700 
              text-xs font-medium 
              px-3 py-1.5 
              rounded-full 
              shadow-sm 
              hover:shadow-md hover:bg-white 
              transition-all duration-200
              transform hover:-translate-y-0.5
            "
            title={file.filename}
          >
            <FileIcon className="w-4 h-4 text-blue-500" />
            <span className="max-w-[200px] truncate">
              {file.filename}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageFilePreview;
