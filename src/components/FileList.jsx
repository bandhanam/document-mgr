import { motion } from 'framer-motion';
import FileCard from './FileCard';
import './FileList.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const listVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

function FileList({ files, loading, searchQuery, onSearchChange, onRefresh, onDelete, onRename, user }) {
  const handleRefresh = async () => {
    await onRefresh();
  };
  return (
    <motion.div className="files-section" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="files-toolbar">
        <div className="search-box">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearchChange('')} aria-label="Clear search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <motion.button className="refresh-btn" onClick={handleRefresh} whileTap={{ rotate: 180 }} aria-label="Refresh">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </motion.button>
      </div>

      {loading ? (
        <div className="files-loading">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-icon" />
              <div className="skeleton-lines">
                <div className="skeleton-line skeleton-line-wide" />
                <div className="skeleton-line skeleton-line-narrow" />
              </div>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <h3>{searchQuery ? 'No matching documents' : 'No documents yet'}</h3>
          <p>{searchQuery ? 'Try a different search term' : 'Upload your first document to get started'}</p>
        </motion.div>
      ) : (
        <motion.div className="files-grid" variants={listVariants} initial="initial" animate="animate">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onDelete={onDelete} onRename={onRename} user={user} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default FileList;
