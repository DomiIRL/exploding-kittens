import {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {IAnimation, ICard} from "../../common";
import {useGame} from "./GameContext.tsx";

interface AnimationContextValue {
  animations: CardAnimation[];
  playAnimation: (id: number, animation: IAnimation) => void;
  playManualAnimation: (fromId: string, toId: string, card: ICard | null, durationMs?: number) => void;
  // Node Ref Registry
  registerNode: (id: string, ref: HTMLElement | null) => void;
  getNode: (id: string) => HTMLElement | null;
}

export interface CardAnimation {
  id: number;
  metadata: IAnimation
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const game = useGame();

  const [animations, setAnimations] = useState<CardAnimation[]>([]);
  const lastAnimationTime = useRef(Date.now());
  
  // Ref map resolving 'string ids' -> DOM Elements
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerNode = useCallback((id: string, ref: HTMLElement | null, previousRef?: HTMLElement | null) => {
    if (ref) {
      // console.log(`[AnimationContext] Registered node:`, id, ref);
      nodeRefs.current.set(id, ref);
    } else {
      // Only delete if the node trying to unregister is the one currently registered
      // Prevents race conditions where a replacing component mounts before the old one unmounts
      if (previousRef && nodeRefs.current.get(id) !== previousRef) {
        return;
      }
      // console.log(`[AnimationContext] Deleted node:`, id);
      nodeRefs.current.delete(id);
    }
  }, []);

  const getNode = useCallback((id: string) => {
    return nodeRefs.current.get(id) || null;
  }, []);

  const playAnimation = useCallback((
    id: number,
    animation: IAnimation
  ) => {
    if (animations.some(value1 => value1.id === id)) {
      return
    }

    if (id > lastAnimationTime.current) {
      lastAnimationTime.current = id;
    }

    const newAnimation = { id, metadata: animation };

    setAnimations(prev => [...prev, newAnimation]);

    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== id));
    }, animation.durationMs + 50);

  }, [animations])

  const playManualAnimation = useCallback((
    fromId: string,
    toId: string,
    card: ICard | null = null,
    durationMs = 500
  ) => {
    const id = Date.now();
    playAnimation(id, {
      from: fromId,
      to: toId,
      card: card,
      durationMs: durationMs
    });
  }, [playAnimation]);

  useEffect(() => {
    if (!game.animationsQueue?.queue) {
      return;
    }

    const currentAnimations = game.animationsQueue.queue;
    for (let id of currentAnimations.keys()) {
      if (id > lastAnimationTime.current) {
        const animations = currentAnimations.get(id);
        if (animations) {
          animations.forEach(anim => playAnimation(id, anim))
        }
      }
    }
  }, [game.animationsQueue, playAnimation]);

  // Expose global window command for dev testing
  (window as any).playAnimation = (fromId: string, toId: string, cardName?: string, cardIndex?: number, durationMs = 500) => {
    const card = cardName ? { name: cardName, index: cardIndex ?? 0 } : null;
    playManualAnimation(fromId, toId, card, durationMs);
  };

  const value = {
    animations,
    playManualAnimation: playManualAnimation,
    playAnimation: playAnimation,
    registerNode,
    getNode
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationState() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimationState must be used within an AnimationProvider');
  }
  return context;
}

export function useAnimationNode(id: string) {
  const { registerNode } = useAnimationState();
  const ref = useRef<HTMLElement | null>(null);

  return useCallback((node: HTMLElement | null) => {
    if (node) {
      ref.current = node;
      registerNode(id, node);
    } else {
      registerNode(id, null);
      ref.current = null;
    }
  }, [id, registerNode]);
}
