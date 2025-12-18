import { Modal } from '../common/Modal';
import '../common/Button.css';
import '../common/Form.css';

interface NameModalProps {
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function NameModal({ name, onNameChange, onSave, onClose }: NameModalProps) {
  return (
    <Modal onClose={onClose} title="✏️ Change Your Name">
      <div className="form-group">
        <label className="form-label">New Name</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          placeholder="Your name..."
          autoFocus
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          onClick={onClose}
          style={{ flex: 1 }}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={onSave}
          style={{ flex: 1 }}
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

