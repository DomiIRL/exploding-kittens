import { Modal } from '../common/Modal';
import '../common/Button.css';
import '../common/Form.css';

interface CreateMatchModalProps {
  matchName: string;
  numPlayers: number;
  deckType: string;
  openCards: boolean;
  spectatorsCardsHidden: boolean;
  creating: boolean;
  onMatchNameChange: (name: string) => void;
  onNumPlayersChange: (num: number) => void;
  onDeckTypeChange: (type: string) => void;
  onOpenCardsChange: (checked: boolean) => void;
  onSpectatorsCardsHiddenChange: (checked: boolean) => void;
  onCreateMatch: () => void;
  onClose: () => void;
}

export function CreateMatchModal({
  matchName,
  numPlayers,
  deckType,
  openCards,
  spectatorsCardsHidden,
  creating,
  onMatchNameChange,
  onNumPlayersChange,
  onDeckTypeChange,
  onOpenCardsChange,
  onSpectatorsCardsHiddenChange,
  onCreateMatch,
  onClose,
}: CreateMatchModalProps) {
  return (
    <Modal onClose={onClose} title="💥 Create New Match 💥">
      <div className="form-group">
        <label className="form-label">Match Name</label>
        <input
          type="text"
          className="form-input"
          value={matchName}
          onChange={(e) => onMatchNameChange(e.target.value)}
          placeholder="Enter match name..."
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">Number of Players</label>
        <select
          className="form-select"
          value={numPlayers}
          onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}
        >
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
          <option value={5}>5 Players</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Deck</label>
        <select
          className="form-select"
          value={deckType}
          onChange={(e) => onDeckTypeChange(e.target.value)}
        >
          <option value="original">🃏 Original Version</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Game Rules</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={openCards}
              onChange={(e) => onOpenCardsChange(e.target.checked)}
            />
            <span>Open Cards (all players can see each other's cards)</span>
          </label>
          <label className={`checkbox-label ${openCards ? 'disabled' : ''}`}>
            <input
              type="checkbox"
              checked={spectatorsCardsHidden}
              onChange={(e) => onSpectatorsCardsHiddenChange(e.target.checked)}
              disabled={openCards}
            />
            <span>Hide Cards from Spectators (eliminated players cannot see cards)</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          onClick={onClose}
          style={{ flex: 1 }}
          disabled={creating}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={onCreateMatch}
          disabled={creating || !matchName.trim()}
          style={{ flex: 1 }}
        >
          {creating ? 'Creating...' : '🎮 Create & Join'}
        </button>
      </div>
    </Modal>
  );
}

