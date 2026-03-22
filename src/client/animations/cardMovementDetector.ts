import {CardMovement, CardVisibility, HandChange, StateSnapshot, StateDiff} from './cardAnimationTypes';
import {ICard} from "../../common";

const diffHands = (
  current: Record<string, number>,
  previous: Record<string, number>
): HandChange[] =>
  Object.entries(current)
    .map(([playerId, count]) => ({playerId, delta: count - (previous[playerId] ?? 0)}))
    .filter(c => c.delta !== 0);

export const diffSnapshots = (current: StateSnapshot, stable: StateSnapshot): StateDiff => ({
  drawDelta: current.drawSize - stable.drawSize,
  discardDelta: current.discardSize - stable.discardSize,
  gainers: diffHands(current.handCounts, stable.handCounts).filter(c => c.delta > 0),
  losers: diffHands(current.handCounts, stable.handCounts).filter(c => c.delta < 0),
});

const diffCards = (from: ICard[], to: ICard[]): ICard[] =>
  from.filter(a => !to.some(b => b.name === a.name && b.index === a.index));

const resolveVisibility = (
  senderId: string | null,
  receiverId: string | null,
  isPublic: boolean,
): CardVisibility => {
  if (isPublic) return {type: 'public'};
  const ids = [senderId, receiverId].filter(Boolean) as string[];
  return ids.length > 0 ? {type: 'participants', ids} : {type: 'hidden'};
};

const resolveCard = (
  visibility: CardVisibility,
  selfPlayerId: string | null,
  candidates: (ICard | null | undefined)[]
): ICard | null => {
  const card = candidates.find(c => c != null) ?? null;
  if (visibility.type === 'hidden') return null;
  if (visibility.type === 'public') return card;
  if (visibility.type === 'participants') {
    return selfPlayerId && visibility.ids.includes(selfPlayerId) ? card : null;
  }
  return null;
};

export const detectMovements = (
  diff: StateDiff,
  stable: StateSnapshot,
  current: StateSnapshot,
  selfPlayerId: string | null,
): CardMovement[] => {
  const movements: CardMovement[] = [];
  let stagger = 0;

  const gainedBySelf = diffCards(current.selfHand, stable.selfHand);
  const lostBySelf   = diffCards(stable.selfHand, current.selfHand);

  // ── Draw pile → player hand ───────────────────────────────────────────────
  if (diff.drawDelta < 0 && diff.gainers.length > 0) {
    diff.gainers.forEach(gainer => {
      for (let i = 0; i < gainer.delta; i++) {
        const isSelf = gainer.playerId === selfPlayerId;
        const visibility = resolveVisibility(null, gainer.playerId, false);
        const card = resolveCard(visibility, selfPlayerId, [isSelf ? gainedBySelf[i] : undefined]);
        movements.push({
          card, staggerIndex: stagger++,
          from: {kind: 'pile', id: 'draw-pile'},
          to:   {kind: 'player', id: gainer.playerId},
          visibility,
        });
      }
    });
  }

  // ── Player hand → discard pile ────────────────────────────────────────────
  // Always use topCard — discard is public and it's the authoritative card identity.
  // This also fixes the "wrong index" bug with duplicate card types.
  if (diff.discardDelta > 0 && diff.losers.length > 0) {
    diff.losers.forEach(loser => {
      for (let i = 0; i < Math.abs(loser.delta); i++) {
        const isSelf = loser.playerId === selfPlayerId;
        const card = isSelf ? lostBySelf[i] : current.discardTop;
        movements.push({
          card,
          staggerIndex: stagger++,
          from: {kind: 'player', id: loser.playerId},
          to:   {kind: 'pile', id: 'discard-pile'},
          visibility: {type: 'public'},
        });
      }
    });
  }

  // ── Discard pile → player hand ────────────────────────────────────────────
  if (diff.discardDelta < 0 && diff.gainers.length > 0 && diff.drawDelta === 0) {
    diff.gainers.forEach(gainer => {
      movements.push({
        card: stable.discardTop, // what was on top before the move
        staggerIndex: stagger++,
        from: {kind: 'pile', id: 'discard-pile'},
        to:   {kind: 'player', id: gainer.playerId},
        visibility: {type: 'public'},
      });
    });
  }

  // ── Player hand → draw pile (defuse, insert) ──────────────────────────────
  if (diff.drawDelta > 0 && diff.losers.length > 0 && diff.discardDelta === 0) {
    diff.losers.forEach(loser => {
      for (let i = 0; i < Math.abs(loser.delta); i++) {
        const isSelf = loser.playerId === selfPlayerId;
        const visibility = resolveVisibility(loser.playerId, null, false);
        const card = resolveCard(visibility, selfPlayerId, [isSelf ? lostBySelf[i] : undefined]);
        movements.push({
          card, staggerIndex: stagger++,
          from: {kind: 'player', id: loser.playerId},
          to:   {kind: 'pile', id: 'draw-pile'},
          visibility,
        });
      }
    });
  }

  // ── Discard pile → draw pile (reshuffle) ──────────────────────────────────
  if (diff.discardDelta < 0 && diff.drawDelta > 0 && diff.gainers.length === 0 && diff.losers.length === 0) {
    movements.push({
      card: stable.discardTop,
      staggerIndex: stagger++,
      from: {kind: 'pile', id: 'discard-pile'},
      to:   {kind: 'pile', id: 'draw-pile'},
      visibility: {type: 'public'},
    });
  }

  // ── Player hand → player hand (favor, steal, combo) ───────────────────────
  if (diff.drawDelta === 0 && diff.discardDelta === 0 && diff.gainers.length > 0 && diff.losers.length > 0) {
    const allLosers = diff.losers.flatMap(l => Array(Math.abs(l.delta)).fill(l.playerId));
    const allGainers = diff.gainers.flatMap(g => Array(g.delta).fill(g.playerId));
    const numMoves = Math.min(allLosers.length, allGainers.length);

    for (let i = 0; i < numMoves; i++) {
      const loserId = allLosers[i];
      const gainerId = allGainers[i];
      const isSelfReceiver = gainerId === selfPlayerId;
      const isSelfSender = loserId === selfPlayerId;
      const visibility = resolveVisibility(loserId, gainerId, false);
      const card = resolveCard(visibility, selfPlayerId, [
        isSelfReceiver ? gainedBySelf[i] : undefined,
        isSelfSender ? lostBySelf[i] : undefined,
      ]);
      movements.push({
        card,
        staggerIndex: stagger++,
        from: {kind: 'player', id: loserId},
        to: {kind: 'player', id: gainerId},
        visibility,
      });
    }
  }

  return movements;
};
