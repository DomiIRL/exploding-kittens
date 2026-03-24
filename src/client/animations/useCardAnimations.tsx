import {useState, useCallback, useRef, useEffect} from 'react';
import CardAnimation, {CardAnimationData} from '../components/board/card-animation/CardAnimation';
import {ICard} from '../../common';
import {TheGameClient} from '../entities/game-client.ts';
import {StateSnapshot} from './cardAnimationTypes';
import {detectMovements, diffSnapshots} from './cardMovementDetector';

const STAGGER_MS = 120;
const DEBOUNCE_MS = 50;

const takeSnapshot = (game: TheGameClient, selfPlayerId: string | null): StateSnapshot => ({
  drawSize:     game.piles.drawPile.size,
  discardSize:  game.piles.discardPile.size,
  discardTop:   game.piles.discardPile.topCard,
  handCounts:   Object.fromEntries(game.players.allPlayers.map(p => [p.id, p.handSize])),
  selfHand:     [...(game.players.allPlayers.find(p => p.id === selfPlayerId)?.hand ?? [])],
});

const endpointId = (e: {kind: string; id: string}) =>
  e.kind === 'pile' ? e.id : `player-${e.id}`;

export const useCardAnimations = (game: TheGameClient) => {
  const selfPlayerId = game.selfPlayerId;

  const [animations, setAnimations] = useState<CardAnimationData[]>([]);
  const animationIdCounter = useRef(0);

  const stableSnapshot = useRef<StateSnapshot>(takeSnapshot(game, selfPlayerId));
  const debounceTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSnapshot = useRef<StateSnapshot | null>(null);

  const getElementCenter = useCallback((id: string) => {
    const el = document.querySelector(`[data-animation-id="${id}"]`) as HTMLElement;
    if (!el) { console.warn(`Animation target not found: ${id}`); return null; }
    const r = el.getBoundingClientRect();
    return {x: r.left + r.width / 2, y: r.top + r.height / 2};
  }, []);

  const triggerCardMovement = useCallback((
    card: ICard | null, fromId: string, toId: string, delay = 0
  ) => {
    const from = getElementCenter(fromId);
    const to   = getElementCenter(toId);
    if (!from || !to) return;
    setAnimations(prev => [...prev, {
      id: `card-anim-${animationIdCounter.current++}`,
      card, from, to, duration: 600, delay,
    }]);
  }, [getElementCenter]);

  const handleAnimationComplete = useCallback((id: string) => {
    setAnimations(prev => prev.filter(a => a.id !== id));
  }, []);

  // Fine-grained dependency keys so the effect fires even when
  // game.players is the same object reference but hand contents changed
  const handCountKey = game.players.allPlayers.map(p => `${p.id}:${p.handSize}`).join(',');
  const selfHandKey  = game.players.allPlayers
    .find(p => p.id === selfPlayerId)?.hand
    .map(c => `${c.name}:${c.index}`).join(',') ?? '';

  useEffect(() => {
    const current = takeSnapshot(game, selfPlayerId);

    if (!debounceTimer.current) {
      // New debounce window — lock in the stable baseline
      stableSnapshot.current = pendingSnapshot.current ?? stableSnapshot.current;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    pendingSnapshot.current = current;

    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
      const snap = pendingSnapshot.current!;
      const diff = diffSnapshots(snap, stableSnapshot.current);
      const movements = detectMovements(diff, stableSnapshot.current, snap, selfPlayerId);

      movements.forEach(m =>
        triggerCardMovement(m.card, endpointId(m.from), endpointId(m.to), m.staggerIndex * STAGGER_MS)
      );

      stableSnapshot.current = snap;
      pendingSnapshot.current = null;
    }, DEBOUNCE_MS);

    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [
    game.piles.drawPile.size,
    game.piles.discardPile.size,
    handCountKey,   // replaces game.players — fires when any count changes
    selfHandKey,    // fires when self's actual card contents change
    triggerCardMovement,
    selfPlayerId,
  ]);

  const AnimationLayer = useCallback(() => (
    <>
      {animations.map(anim => (
        <CardAnimation key={anim.id} animation={anim} onComplete={handleAnimationComplete}/>
      ))}
    </>
  ), [animations, handleAnimationComplete]);

  return {animations, AnimationLayer, triggerCardMovement};
};
