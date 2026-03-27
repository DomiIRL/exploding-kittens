import { createContext, useContext, useRef, useState, ReactNode, useCallback } from 'react';
import { CardAnimation } from '../components/animations/AnimationManager';

interface AnimationContextValue {
  animations: CardAnimation[];
  playAnimation: (fromId: string, toId: string, card: { name: string; index: number } | null, durationMs?: number) => void;
  // Node Ref Registry
  registerNode: (id: string, ref: HTMLElement | null) => void;
  getNode: (id: string) => HTMLElement | null;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [animations, setAnimations] = useState<CardAnimation[]>([]);
  const animationCounter = useRef(0);
  
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
    fromId: string,
    toId: string,
    card: { name: string; index: number } | null = null,
    durationMs = 500
  ) => {
    const id = `anim_${animationCounter.current++}`;
    const newAnim: CardAnimation = { id, fromId, toId, card, durationMs };
    
    setAnimations(prev => [...prev, newAnim]);

    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== id));
    }, durationMs + 50);
  }, []);

  // Expose global window command for dev testing
  if (typeof window !== 'undefined') {
    (window as any).playAnimation = (fromId: string, toId: string, cardName?: string, cardIndex?: number, durationMs = 500) => {
      const card = cardName ? { name: cardName, index: cardIndex ?? 0 } : null;
      playAnimation(fromId, toId, card, durationMs);
    };
  }

  const value = {
    animations,
    playAnimation,
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

  const setRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      ref.current = node;
      registerNode(id, node);
    } else {
      registerNode(id, null);
      ref.current = null;
    }
  }, [id, registerNode]);

  return setRef;
}
