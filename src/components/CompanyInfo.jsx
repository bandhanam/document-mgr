import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './CompanyInfo.css';

const COMPANY = {
  name: 'Bandhanam Private Limited',
  cin: 'UXXXXXXXXXXPTCXXXXXX',
  pan: 'XXXXXXXXXX',
  gstin: 'XXAAAAA0000A1Z5',
  address: [
    'Nandour Kalan, Sakti',
    'District – Janjgir Champa',
    'Chhattisgarh – 495689, India',
  ],
  bank: {
    name: 'State Bank of India',
    accountName: 'Bandhanam Private Limited',
    accountNo: 'XXXXXXXXXXXX',
    ifsc: 'SBIN000XXXX',
    branch: 'Sakti, Chhattisgarh',
  },
  email: 'info@bandhanam.com',
  phone: '+91 XXXXX XXXXX',
  website: 'www.bandhanam.com',
  director: 'Director / Authorized Person',
};

function getFormattedText() {
  return `━━━━━━━━━━━━━━━━━━━━━━
*BANDHANAM PRIVATE LIMITED*
Company Master Details
━━━━━━━━━━━━━━━━━━━━━━

📋 *Company Information*
Company Name: ${COMPANY.name}
CIN: ${COMPANY.cin}
PAN: ${COMPANY.pan}
GSTIN: ${COMPANY.gstin}

📍 *Registered Office*
${COMPANY.name}
${COMPANY.address.join('\n')}

🏦 *Bank Details*
Bank: ${COMPANY.bank.name}
A/C Name: ${COMPANY.bank.accountName}
A/C No: ${COMPANY.bank.accountNo}
IFSC: ${COMPANY.bank.ifsc}
Branch: ${COMPANY.bank.branch}

📞 *Contact*
Email: ${COMPANY.email}
Phone: ${COMPANY.phone}
Web: ${COMPANY.website}

✍️ *Authorized Signatory*
${COMPANY.director}

━━━━━━━━━━━━━━━━━━━━━━`;
}

function CompanyInfo({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFormattedText());
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(getFormattedText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="ci-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="ci-modal"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ci-header">
            <div className="ci-header-left">
              <img src="/logo.png" alt="Logo" className="ci-logo" />
              <div>
                <h2 className="ci-company-name">{COMPANY.name}</h2>
                <span className="ci-subtitle">Company Master Details</span>
              </div>
            </div>
            <button className="ci-close" onClick={onClose} aria-label="Close">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="ci-body">
            <div className="ci-section">
              <h4 className="ci-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                Company Information
              </h4>
              <div className="ci-grid">
                <div className="ci-field"><span className="ci-label">CIN</span><span className="ci-value">{COMPANY.cin}</span></div>
                <div className="ci-field"><span className="ci-label">PAN</span><span className="ci-value">{COMPANY.pan}</span></div>
                <div className="ci-field ci-field-full"><span className="ci-label">GSTIN</span><span className="ci-value">{COMPANY.gstin}</span></div>
              </div>
            </div>

            <div className="ci-section">
              <h4 className="ci-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Registered Office
              </h4>
              <div className="ci-address">
                <p>{COMPANY.name}</p>
                {COMPANY.address.map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>

            <div className="ci-section">
              <h4 className="ci-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                Bank Details
              </h4>
              <div className="ci-grid">
                <div className="ci-field"><span className="ci-label">Bank</span><span className="ci-value">{COMPANY.bank.name}</span></div>
                <div className="ci-field"><span className="ci-label">Branch</span><span className="ci-value">{COMPANY.bank.branch}</span></div>
                <div className="ci-field"><span className="ci-label">A/C Name</span><span className="ci-value">{COMPANY.bank.accountName}</span></div>
                <div className="ci-field"><span className="ci-label">A/C No</span><span className="ci-value ci-mono">{COMPANY.bank.accountNo}</span></div>
                <div className="ci-field"><span className="ci-label">IFSC</span><span className="ci-value ci-mono">{COMPANY.bank.ifsc}</span></div>
              </div>
            </div>

            <div className="ci-section">
              <h4 className="ci-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.11 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                Contact Details
              </h4>
              <div className="ci-grid">
                <div className="ci-field"><span className="ci-label">Email</span><span className="ci-value">{COMPANY.email}</span></div>
                <div className="ci-field"><span className="ci-label">Phone</span><span className="ci-value">{COMPANY.phone}</span></div>
                <div className="ci-field"><span className="ci-label">Website</span><span className="ci-value">{COMPANY.website}</span></div>
              </div>
            </div>

            <div className="ci-section">
              <h4 className="ci-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Authorized Signatory
              </h4>
              <p className="ci-signatory">{COMPANY.director}</p>
            </div>
          </div>

          <div className="ci-footer">
            <button className="ci-btn copy" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  Copy to Clipboard
                </>
              )}
            </button>
            <button className="ci-btn whatsapp" onClick={handleWhatsApp}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CompanyInfo;
