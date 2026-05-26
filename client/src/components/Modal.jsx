import React from 'react';
import { FiX } from 'react-icons/fi';
import './Modal.css';

export default function Modal({ open, onClose, title, children, width = '500px' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
