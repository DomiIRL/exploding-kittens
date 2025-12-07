import {useState, useEffect, useRef} from 'react';
import {GameState} from '../../common';
import {ExplosionEvent} from '../components/board/explosion-overlay/ExplosionOverlay';

interface PlayerData {
  [key: string]: {
    hand: any[];
    hand_count: number;
    isAlive: boolean;
  };
}

interface ExplosionEventData {
  event: ExplosionEvent;
  playerName: string;
  isSelf: boolean;
}

/**
 * Hook to detect and manage explosion/defuse events in the game
 */
export const useExplosionEvents = (
  G: GameState,
  allPlayers: PlayerData,
  playerID: string | null
): ExplosionEventData & { clearEvent: () => void } => {
  const [explosionEvent, setExplosionEvent] = useState<ExplosionEvent>(null);
  const [explosionPlayerName, setExplosionPlayerName] = useState<string>('');
  const [explosionIsSelf, setExplosionIsSelf] = useState<boolean>(false);

  const previousDiscardPileLength = useRef<number>(0);
  const previousPlayerAliveStatus = useRef<{[key: string]: boolean}>({});
  const previousPlayerHandCounts = useRef<{[key: string]: number}>({});
  const lastDefuseEventId = useRef<string>('');
  const lastExplosionEventId = useRef<string>('');

  useEffect(() => {
    // Detect defuse card being played
    if (G.discardPile.length > previousDiscardPileLength.current) {
      const newCards = G.discardPile.slice(previousDiscardPileLength.current);
      const defuseCard = newCards.find(card => card.name === 'defuse');

      if (defuseCard) {
        // Find who played the defuse card by checking whose hand decreased
        let defusePlayerID: string | null = null;

        for (const pid of Object.keys(allPlayers)) {
          const currentHandCount = allPlayers[pid].hand_count;
          const previousHandCount = previousPlayerHandCounts.current[pid] ?? currentHandCount;

          // The player who defused will have lost a card from their hand
          if (currentHandCount < previousHandCount) {
            defusePlayerID = pid;
            break;
          }
        }

        const eventId = `defuse-${G.discardPile.length}`;

        if (defusePlayerID && eventId !== lastDefuseEventId.current && !explosionEvent) {
          const isSelf = defusePlayerID === playerID;
          const playerName = isSelf ? 'You' : `Player ${parseInt(defusePlayerID) + 1}`;

          console.log('💥 Defuse event detected for player:', defusePlayerID);
          lastDefuseEventId.current = eventId;
          setExplosionEvent('defused');
          setExplosionPlayerName(playerName);
          setExplosionIsSelf(isSelf);
        }
      }
    }

    // Detect player death (explosion)
    for (const pid of Object.keys(allPlayers)) {
      const player = allPlayers[pid];
      const wasAlive = previousPlayerAliveStatus.current[pid] ?? true;
      const isNowDead = !player.isAlive;

      if (wasAlive && isNowDead) {
        const eventId = `explode-${pid}-${G.discardPile.length}`;

        if (eventId !== lastExplosionEventId.current && !explosionEvent) {
          const isSelf = pid === playerID;
          const playerName = isSelf ? 'You' : `Player ${parseInt(pid) + 1}`;

          lastExplosionEventId.current = eventId;
          setExplosionEvent('exploding');
          setExplosionPlayerName(playerName);
          setExplosionIsSelf(isSelf);
        }
      }

      previousPlayerAliveStatus.current[pid] = player.isAlive;
    }

    // Update previous hand counts for all players
    for (const pid of Object.keys(allPlayers)) {
      previousPlayerHandCounts.current[pid] = allPlayers[pid].hand_count;
    }

    previousDiscardPileLength.current = G.discardPile.length;
  }, [G.discardPile, G.discardPile.length, allPlayers, playerID, explosionEvent]);

  return {
    event: explosionEvent,
    playerName: explosionPlayerName,
    isSelf: explosionIsSelf,
    clearEvent: () => setExplosionEvent(null),
  };
};

