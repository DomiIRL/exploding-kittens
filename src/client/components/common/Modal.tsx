import {ReactNode} from 'react';
import './Modal.css';

interface ModalProps {
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({onClose, title, children}: ModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

