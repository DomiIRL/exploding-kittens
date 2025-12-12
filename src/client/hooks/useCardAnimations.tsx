import React, {useState, useCallback, useRef, useEffect} from 'react';
import CardAnimation, {CardAnimationData} from '../components/board/card-animation/CardAnimation';
import {Card, GameState} from '../../common';

interface UseCardAnimationsReturn {
  animations: CardAnimationData[];
  AnimationLayer: () => React.JSX.Element;
  triggerCardMovement: (card: Card | null, fromId: string, toId: string) => void;
}

type PlayerHandCounts = Record<string, number>;

interface HandChange {
  playerId: string;
  delta: number;
}

export const useCardAnimations = (G: GameState): UseCardAnimationsReturn => {
  const [animations, setAnimations] = useState<CardAnimationData[]>([]);
  const animationIdCounter = useRef(0);
  const previousDrawPileLength = useRef(G.client.drawPileLength);
  const previousDiscardPileLength = useRef(G.discardPile.length);
  const previousPlayerHands = useRef<PlayerHandCounts>({});

  const getElementCenter = useCallback((id: string): { x: number; y: number } | null => {
    const element = document.querySelector(`[data-animation-id="${id}"]`) as HTMLElement;
    if (!element) {
      console.warn(`Element not found for animation id: ${id}`);
      return null;
    }

    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const triggerCardMovement = useCallback((
    card: Card | null,
    fromId: string,
    toId: string,
    delay = 0
  ) => {
    const fromPos = getElementCenter(fromId);
    const toPos = getElementCenter(toId);

    if (!fromPos || !toPos) return;

    const newAnimation: CardAnimationData = {
      id: `card-anim-${animationIdCounter.current++}`,
      card,
      from: fromPos,
      to: toPos,
      duration: 600,
      delay,
    };

    setAnimations(prev => [...prev, newAnimation]);
  }, [getElementCenter]);

  const handleAnimationComplete = useCallback((id: string) => {
    setAnimations(prev => prev.filter(anim => anim.id !== id));
  }, []);

  const getPlayerHandCounts = (): PlayerHandCounts => {
    const counts: PlayerHandCounts = {};
    document.querySelectorAll('[data-player-id]').forEach(el => {
      const playerId = el.getAttribute('data-player-id');
      const handCount = el.getAttribute('data-hand-count');
      if (playerId && handCount) {
        counts[playerId] = parseInt(handCount);
      }
    });
    return counts;
  };

  const getHandChanges = (currentCounts: PlayerHandCounts, previousCounts: PlayerHandCounts): HandChange[] => {
    return Object.entries(currentCounts)
      .map(([playerId, currentCount]) => ({
        playerId,
        delta: currentCount - (previousCounts[playerId] || 0)
      }))
      .filter(change => change.delta !== 0);
  };

  useEffect(() => {
    const currentHandCounts = getPlayerHandCounts();
    const handChanges = getHandChanges(currentHandCounts, previousPlayerHands.current);

    const drawPileDecreased = G.client.drawPileLength < previousDrawPileLength.current;
    const discardPileIncreased = G.discardPile.length > previousDiscardPileLength.current;
    const pilesUnchanged = G.client.drawPileLength === previousDrawPileLength.current &&
      G.discardPile.length === previousDiscardPileLength.current;

    if (drawPileDecreased) {
      handChanges
        .filter(change => change.delta > 0)
        .forEach(change => triggerCardMovement(null, 'draw-pile', `player-${change.playerId}`));
    }

    if (discardPileIncreased) {
      const lastCard = G.discardPile[G.discardPile.length - 1];
      handChanges
        .filter(change => change.delta < 0)
        .forEach(change => triggerCardMovement(lastCard, `player-${change.playerId}`, 'discard-pile'));
    }

    if (pilesUnchanged && handChanges.length > 0) {
      const playerGained = handChanges.find(change => change.delta > 0);
      const playerLost = handChanges.find(change => change.delta < 0);

      if (playerGained && playerLost) {
        triggerCardMovement(null, `player-${playerLost.playerId}`, `player-${playerGained.playerId}`);
      }
    }

    previousDrawPileLength.current = G.client.drawPileLength;
    previousDiscardPileLength.current = G.discardPile.length;
    previousPlayerHands.current = currentHandCounts;
  }, [G.client.drawPileLength, G.discardPile.length, G.discardPile, triggerCardMovement]);

  const AnimationLayer = useCallback(() => (
    <>
      {animations.map(animation => (
        <CardAnimation
          key={animation.id}
          animation={animation}
          onComplete={handleAnimationComplete}
        />
      ))}
    </>
  ), [animations, handleAnimationComplete]);

  return {
    animations,
    AnimationLayer,
    triggerCardMovement,
  };
};
