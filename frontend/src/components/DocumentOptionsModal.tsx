import React from 'react';
import { X, MessageCircle, HelpCircle, BookOpen, ArrowRight } from 'lucide-react';

interface UploadedFile {
  fileId: string;
  filename: string;
}

interface DocumentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: UploadedFile[];
  onCreateSession: () => void;
}

const DocumentOptionsModal: React.FC<DocumentOptionsModalProps> = ({
  isOpen,
  onClose,
  files,
  onCreateSession,
  }) => {
  if (!isOpen) return null;

  const options = [
    {
      id: 'session',
      title: 'Create Session',
      description: 'Start a conversational learning session with AI explanations',
      icon: MessageCircle,
      gradient: 'from-blue-500 to-cyan-500',
      onClick: onCreateSession,
      available: true
    },
    ,
    
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Choose Learning Method</h2>
              <p className="text-slate-600 mt-1">Select how you'd like to learn from your documents</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X size={24} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Files Summary */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
            Uploaded Documents ({files.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {files.map((file) => (
              <div
                key={file.fileId}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="max-w-xs truncate" title={file.filename}>
                  {file.filename}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="p-6">
          <div className="space-y-4">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={option.available ? option.onClick : undefined}
                  disabled={!option.available}
                  className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${
                    option.available
                      ? 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] bg-white'
                      : 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r ${option.gradient} ${
                        option.available ? 'group-hover:scale-110' : ''
                      } transition-transform duration-300 shadow-lg`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                          {option.title}
                          {!option.available && (
                            <span className="ml-2 text-sm font-normal text-slate-500">(Coming Soon)</span>
                          )}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {option.available && (
                      <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentOptionsModal;
