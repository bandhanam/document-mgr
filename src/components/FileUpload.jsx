import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { uploadFile } from '../api';
import './FileUpload.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

function FileUpload({ onUploadComplete, user }) {
  const [file, setFile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      const f = accepted[0];
      setFile(f);
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, '');
      setDisplayName(nameWithoutExt);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');
    if (!displayName.trim()) return toast.error('Please enter a document name');

    try {
      setUploading(true);
      setProgress(0);
      const fileEntry = await uploadFile(file, displayName.trim(), user, setProgress);
      toast.success(`"${displayName}" uploaded successfully!`);
      setFile(null);
      setDisplayName('');
      setProgress(0);
      await onUploadComplete?.(fileEntry);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setDisplayName('');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('word') || type?.includes('document')) return '📝';
    if (type?.includes('sheet') || type?.includes('excel')) return '📊';
    if (type?.includes('zip') || type?.includes('archive')) return '📦';
    return '📎';
  };

  return (
    <motion.div className="upload-section" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="upload-card">
        <div className="upload-header">
          <h2>Upload Document</h2>
          <p>Securely store your documents in the cloud</p>
        </div>

        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${file ? 'dropzone-has-file' : ''}`}
        >
          <input {...getInputProps()} />
          {file ? (
            <motion.div className="file-preview" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <span className="file-icon-large">{getFileIcon(file.type)}</span>
              <div className="file-preview-info">
                <span className="file-preview-name">{file.name}</span>
                <span className="file-preview-size">{formatSize(file.size)}</span>
              </div>
              <button
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                aria-label="Remove file"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <div className="dropzone-content">
              <motion.div
                className="dropzone-icon"
                animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </motion.div>
              <p className="dropzone-text">
                {isDragActive ? 'Drop it here!' : 'Drag & drop a file here'}
              </p>
              <p className="dropzone-hint">or tap to browse</p>
            </div>
          )}
        </div>

        <div className="name-input-group">
          <label htmlFor="docName" className="input-label">
            Document Name
          </label>
          <input
            id="docName"
            type="text"
            className="name-input"
            placeholder="e.g. Company Registration Certificate"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={uploading}
            maxLength={100}
          />
        </div>

        {uploading && (
          <motion.div className="progress-wrapper" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="progress-label">{progress}% uploading...</span>
          </motion.div>
        )}

        <motion.button
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || !displayName.trim() || uploading}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
        >
          {uploading ? (
            <span className="btn-loader" />
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Document
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default FileUpload;
