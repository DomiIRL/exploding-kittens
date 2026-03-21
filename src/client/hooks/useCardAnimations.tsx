import React, {useState, useCallback, useRef, useEffect} from 'react';
import CardAnimation, {CardAnimationData} from '../components/board/card-animation/CardAnimation';
import {ICard, IGameState, IPlayers} from '../../common';

interface UseCardAnimationsReturn {
  animations: CardAnimationData[];
  AnimationLayer: () => React.JSX.Element;
  triggerCardMovement: (card: ICard | null, fromId: string, toId: string) => void;
}

type PlayerHandCounts = Record<string, number>;

interface HandChange {
  playerId: string;
  delta: number;
}

export const useCardAnimations = (G: IGameState, players: IPlayers, selfPlayerId: string | null): UseCardAnimationsReturn => {
  const [animations, setAnimations] = useState<CardAnimationData[]>([]);
  const animationIdCounter = useRef(0);
  const previousDrawPileLength = useRef(G.client.drawPileLength);
  const previousDiscardPileLength = useRef(G.piles.discardPile.length);
  const previousPlayerHands = useRef<PlayerHandCounts>({});
  const previousLocalHand = useRef<ICard[]>([]);

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
    card: ICard | null,
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
    const discardPileIncreased = G.piles.discardPile.length > previousDiscardPileLength.current;
    const pilesUnchanged = G.client.drawPileLength === previousDrawPileLength.current &&
      G.piles.discardPile.length === previousDiscardPileLength.current;

    if (drawPileDecreased) {
      handChanges
        .filter(change => change.delta > 0)
        .forEach(change => {
          let card: ICard | null = null;
          // If local player gained a card, check their hand for the new card
          if (change.playerId === selfPlayerId && players[selfPlayerId]) {
            const hand = players[selfPlayerId].hand;
            if (hand.length > 0) {
              card = hand[hand.length - 1];
            }
          }
          triggerCardMovement(card, 'draw-pile', `player-${change.playerId}`);
        });
    }

    if (discardPileIncreased) {
      const lastCard = G.piles.discardPile[G.piles.discardPile.length - 1];
      handChanges
        .filter(change => change.delta < 0)
        .forEach(change => triggerCardMovement(lastCard, `player-${change.playerId}`, 'discard-pile'));
    }

    if (pilesUnchanged && handChanges.length > 0) {
      const playerGained = handChanges.find(change => change.delta > 0);
      const playerLost = handChanges.find(change => change.delta < 0);

      if (playerGained && playerLost) {
        let card: ICard | null = null;
        // If local player gained the transferred card, look it up
        if (playerGained.playerId === selfPlayerId && players[selfPlayerId]) {
          const hand = players[selfPlayerId].hand;
          if (hand.length > 0) {
            card = hand[hand.length - 1];
          }
        } else if (playerLost.playerId === selfPlayerId && players[selfPlayerId]) {
          // If local player lost the card, diff with previous hand to find which one
          const currentHand = players[selfPlayerId].hand;
          const previousHand = previousLocalHand.current;
          
          const lostCard = previousHand.find(prevCard => 
            !currentHand.some(currCard => 
              currCard.name === prevCard.name && currCard.index === prevCard.index
            )
          );
          
          if (lostCard) {
            card = lostCard;
          }
        }

        triggerCardMovement(card, `player-${playerLost.playerId}`, `player-${playerGained.playerId}`);
      }
    }

    previousDrawPileLength.current = G.client.drawPileLength;
    previousDiscardPileLength.current = G.piles.discardPile.length;
    previousPlayerHands.current = currentHandCounts;
    
    if (selfPlayerId && players[selfPlayerId]) {
      previousLocalHand.current = players[selfPlayerId].hand;
    } else {
      previousLocalHand.current = [];
    }
  }, [G.client.drawPileLength, G.piles.discardPile.length, G.piles.discardPile, triggerCardMovement, players, selfPlayerId]);

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
