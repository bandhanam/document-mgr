import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getDownloadUrl, deleteFile, renameFile } from '../api';
import './FileCard.css';

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

function FileCard({ file, onDelete, onRename, user }) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(file.displayName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (name, type) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (type?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️';
    if (type?.includes('pdf') || ext === 'pdf') return '📄';
    if (type?.includes('word') || ['doc', 'docx'].includes(ext)) return '📝';
    if (type?.includes('sheet') || ['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (type?.includes('presentation') || ['ppt', 'pptx'].includes(ext)) return '📽️';
    if (type?.includes('zip') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    if (type?.includes('text') || ['txt', 'md', 'log'].includes(ext)) return '📃';
    return '📎';
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const url = await getDownloadUrl(file.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteFile(file.id);
      toast.success(`"${file.displayName}" deleted`);
      onDelete?.(file.id);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const startEditing = () => {
    setEditValue(file.displayName);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditValue(file.displayName);
  };

  const handleSaveRename = async () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    if (trimmed === file.displayName) {
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      await renameFile(file.id, trimmed, user);
      toast.success('Renamed successfully');
      onRename?.(file.id, trimmed, user);
      setEditing(false);
    } catch {
      toast.error('Rename failed');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') cancelEditing();
  };

  const dateStr = file.uploadedAt
    ? format(new Date(file.uploadedAt), 'MMM dd, yyyy · h:mm a')
    : '';

  return (
    <motion.div className="file-card" variants={cardVariants} layout>
      <div className="file-card-icon">
        {getFileIcon(file.originalName, file.contentType)}
      </div>

      <div className="file-card-info">
        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.div
              key="edit"
              className="edit-name-row"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <input
                ref={inputRef}
                className="edit-name-input"
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={saving}
                maxLength={100}
              />
              <button
                className="edit-action-btn edit-save"
                onClick={handleSaveRename}
                disabled={saving}
                aria-label="Save"
                title="Save (Enter)"
              >
                {saving ? <span className="mini-loader" /> : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <button
                className="edit-action-btn edit-cancel"
                onClick={cancelEditing}
                disabled={saving}
                aria-label="Cancel"
                title="Cancel (Esc)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.h4
              key="display"
              className="file-card-name"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              {file.displayName}
            </motion.h4>
          )}
        </AnimatePresence>
        <div className="file-card-meta">
          <span className="file-card-original" title={file.originalName}>{file.originalName}</span>
          <span className="meta-sep">·</span>
          <span>{formatSize(file.size)}</span>
          {dateStr && (
            <>
              <span className="meta-sep">·</span>
              <span>{dateStr}</span>
            </>
          )}
        </div>
        {file.lastUpdatedBy && (
          <div className="file-card-user">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>
              {file.uploadedBy && file.uploadedBy === file.lastUpdatedBy
                ? `Uploaded by ${file.uploadedBy}`
                : `Updated by ${file.lastUpdatedBy}`}
            </span>
          </div>
        )}
      </div>

      <div className="file-card-actions">
        {showConfirm ? (
          <div className="confirm-actions">
            <button className="action-btn confirm-yes" onClick={handleDelete} disabled={deleting} aria-label="Confirm delete">
              {deleting ? <span className="mini-loader" /> : '✓'}
            </button>
            <button className="action-btn confirm-no" onClick={() => setShowConfirm(false)} aria-label="Cancel delete">
              ✕
            </button>
          </div>
        ) : (
          <>
            <motion.button
              className="action-btn edit-btn"
              onClick={startEditing}
              whileTap={{ scale: 0.9 }}
              aria-label="Rename"
              title="Rename"
              disabled={editing}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </motion.button>
            <motion.button
              className="action-btn download-btn"
              onClick={handleDownload}
              disabled={downloading}
              whileTap={{ scale: 0.9 }}
              aria-label="Download"
              title="Download"
            >
              {downloading ? (
                <span className="mini-loader" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
            </motion.button>
            <motion.button
              className="action-btn delete-btn"
              onClick={() => setShowConfirm(true)}
              whileTap={{ scale: 0.9 }}
              aria-label="Delete"
              title="Delete"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </motion.button>
          </>
        )}
      </div>

    </motion.div>
  );
}

export default FileCard;
