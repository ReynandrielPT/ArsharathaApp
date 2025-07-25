import React, { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import UploadDocumentsModal from './UploadDocumentsModal';
import DocumentOptionsModal from './DocumentOptionsModal';


/**
 * Represents a file that has been successfully uploaded.
 */
interface UploadedFile {
  fileId: string;
  filename: string;
}

/**
 * Props for the Dashboard component.
 */
interface DashboardProps {
  /** Callback function to start a new learning session. */
  onStartSession: () => void;
}

/**
 * The Dashboard component serves as the main landing page after a user logs in.
 * It displays a welcome message, quick action buttons for starting new sessions or uploading documents,
 * and a list of recent quizzes.
 */
const Dashboard: React.FC<DashboardProps> = ({ onStartSession }) => {
  // State to control the visibility of the document upload modal.
  const [showUploadModal, setShowUploadModal] = useState(false);
  // State to control the visibility of the document options modal (after upload).
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  // State to store the files that have been uploaded.
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  // State to store the authenticated user's username.
  const [username, setUsername] = useState('');

  /**
   * Effect hook to fetch the authenticated user's profile information (username).
   * This runs once when the component mounts.
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // If no token, user is not authenticated.

        const response = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }, // Include the authentication token.
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.username); // Set the username from the API response.
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };

    fetchProfile();
  }, []); // Empty dependency array ensures this effect runs only once.

  /**
   * Handles the completion of file uploads.
   * Stores the uploaded files and opens the document options modal.
   * @param {UploadedFile[]} files - An array of files that were successfully uploaded.
   */
  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    setShowOptionsModal(true); // Show the modal to choose what to do with the uploaded files.
  };

  /**
   * Handles the action to create a new learning session from uploaded documents.
   * Closes the options modal and triggers the parent's onStartSession callback.
   */
  const handleCreateSession = () => {
    setShowOptionsModal(false);
    onStartSession(); // Call the parent function to start a new session.
  };

  return (
    <>
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-200 mb-2">
              Welcome back, <span className="bg-gradient-to-r from-blue-300 to-blue-400 bg-clip-text text-transparent">{username || '...'}</span>!
            </h1>
            <p className="text-gray-400">Continue your learning journey with VikaAI.</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-gray-200 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => onStartSession()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Start New Session
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                Upload Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      <UploadDocumentsModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFilesUploaded={handleFilesUploaded}
      />

      <DocumentOptionsModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        files={uploadedFiles}
        onCreateSession={handleCreateSession}
      />
    </>
  );
};

export default Dashboard;