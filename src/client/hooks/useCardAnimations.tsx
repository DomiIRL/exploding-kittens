import React, {useState, useCallback, useRef, useEffect} from 'react';
import CardAnimation, {CardAnimationData} from '../components/board/card-animation/CardAnimation';
import {Card, GameState} from '../../common';

interface UseCardAnimationsReturn {
  animations: CardAnimationData[];
  AnimationLayer: () => React.JSX.Element;
  triggerCardMovement: (card: Card | null, fromId: string, toId: string) => void;
}

interface PlayerHandCounts {
  [key: string]: number;
}

interface HandChange {
  playerId: string;
  delta: number;
}

export const useCardAnimations = (G: GameState): UseCardAnimationsReturn => {
  const [animations, setAnimations] = useState<CardAnimationData[]>([]);
  const animationIdCounter = useRef(0);
  const previousDrawPileLength = useRef<number | null>(null);
  const previousDiscardPileLength = useRef<number | null>(null);
  const previousPlayerHands = useRef<PlayerHandCounts>({});
  const isInitialized = useRef(false);

  // Get center position of an element
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

  // Trigger a card movement animation
  const triggerCardMovement = useCallback((
    card: Card | null,
    fromId: string,
    toId: string,
    delay = 0
  ) => {
    const fromPos = getElementCenter(fromId);
    const toPos = getElementCenter(toId);

    if (!fromPos || !toPos) {
      return;
    }

    const animationId = `card-anim-${animationIdCounter.current++}`;
    const newAnimation: CardAnimationData = {
      id: animationId,
      card,
      from: fromPos,
      to: toPos,
      duration: 600,
      delay,
    };

    setAnimations(prev => {
      return [...prev, newAnimation];
    });
  }, [getElementCenter]);

  // Remove completed animation
  const handleAnimationComplete = useCallback((id: string) => {
    setAnimations(prev => prev.filter(anim => anim.id !== id));
  }, []);

  // Get current player hand counts from DOM
  const getPlayerHandCounts = useCallback((): PlayerHandCounts => {
    const counts: PlayerHandCounts = {};
    const playerElements = document.querySelectorAll('[data-player-id]');

    playerElements.forEach(el => {
      const playerId = el.getAttribute('data-player-id');
      const handCount = el.getAttribute('data-hand-count');
      if (playerId && handCount) {
        counts[playerId] = parseInt(handCount);
      }
    });

    return counts;
  }, []);

  // Calculate hand changes for all players
  const getHandChanges = useCallback((
    currentCounts: PlayerHandCounts,
    previousCounts: PlayerHandCounts
  ): HandChange[] => {
    const changes: HandChange[] = [];

    Object.entries(currentCounts).forEach(([playerId, currentCount]) => {
      const previousCount = previousCounts[playerId] || 0;
      const delta = currentCount - previousCount;

      if (delta !== 0) {
        changes.push({ playerId, delta });
      }
    });

    return changes;
  }, []);

  // Handle card draw animations
  const handleCardDraws = useCallback((handChanges: HandChange[]) => {
    handChanges
      .filter(change => change.delta > 0)
      .forEach(change => {
        triggerCardMovement(null, 'draw-pile', `player-${change.playerId}`, 0);
      });
  }, [triggerCardMovement]);

  // Handle card play animations
  const handleCardPlays = useCallback((handChanges: HandChange[], lastCard: Card) => {
    handChanges
      .filter(change => change.delta < 0)
      .forEach(change => {
        triggerCardMovement(lastCard, `player-${change.playerId}`, 'discard-pile', 0);
      });
  }, [triggerCardMovement]);

  // Handle card steal animations
  const handleCardSteals = useCallback((handChanges: HandChange[]) => {
    const playerGained = handChanges.find(change => change.delta > 0);
    const playerLost = handChanges.find(change => change.delta < 0);

    if (playerGained && playerLost) {
      triggerCardMovement(
        null,
        `player-${playerLost.playerId}`,
        `player-${playerGained.playerId}`,
        0
      );
    }
  }, [triggerCardMovement]);

  // Initialize animation system
  useEffect(() => {
    if (!isInitialized.current) {
      previousDrawPileLength.current = G.drawPile.length;
      previousDiscardPileLength.current = G.discardPile.length;
      previousPlayerHands.current = getPlayerHandCounts();
      isInitialized.current = true;
      return;
    }

    const currentHandCounts = getPlayerHandCounts();
    const handChanges = getHandChanges(currentHandCounts, previousPlayerHands.current);

    const drawPileDecreased = previousDrawPileLength.current !== null &&
      G.drawPile.length < previousDrawPileLength.current;
    const discardPileIncreased = previousDiscardPileLength.current !== null &&
      G.discardPile.length > previousDiscardPileLength.current;
    const pilesUnchanged = previousDrawPileLength.current !== null &&
      previousDiscardPileLength.current !== null &&
      G.drawPile.length === previousDrawPileLength.current &&
      G.discardPile.length === previousDiscardPileLength.current;

    // Detect and handle card draws
    if (drawPileDecreased) {
      handleCardDraws(handChanges);
    }

    // Detect and handle card plays
    if (discardPileIncreased) {
      const lastCard = G.discardPile[G.discardPile.length - 1];
      handleCardPlays(handChanges, lastCard);
    }

    // Detect and handle card steals
    if (pilesUnchanged && handChanges.length > 0) {
      handleCardSteals(handChanges);
    }

    // Update tracked values
    previousDrawPileLength.current = G.drawPile.length;
    previousDiscardPileLength.current = G.discardPile.length;
    previousPlayerHands.current = currentHandCounts;
  }, [
    G.drawPile.length,
    G.discardPile.length,
    G.discardPile,
    getPlayerHandCounts,
    getHandChanges,
    handleCardDraws,
    handleCardPlays,
    handleCardSteals
  ]);

  // Animation layer component
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
