export interface CardAnimation {
  id: string;
  fromId: string;
  toId: string;
  card: { name: string; index: number } | null;
  durationMs: number;
}

type AnimationListener = (animations: CardAnimation[]) => void;

class AnimationManager {
  private animations: CardAnimation[] = [];
  private listeners: Set<AnimationListener> = new Set();
  private animationCounter = 0;

  public playAnimation(
    fromId: string,
    toId: string,
    card: { name: string; index: number } | null = null,
    durationMs = 500
  ) {
    const id = `anim_${this.animationCounter++}`;
    const newAnim: CardAnimation = { id, fromId, toId, card, durationMs };
    
    this.animations = [...this.animations, newAnim];
    this.notifyListeners();

    setTimeout(() => {
      this.animations = this.animations.filter(a => a.id !== id);
      this.notifyListeners();
    }, durationMs + 50); // slight buffer to ensure transition finishes
  }

  public getAnimations() {
    return this.animations;
  }

  public subscribe(listener: AnimationListener): () => void {
    this.listeners.add(listener);
    // Send initial state
    listener(this.animations);
    return () => { this.listeners.delete(listener); };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.animations));
  }
}

export const animationManager = new AnimationManager();

// Dev tool testing command accessible from console
(window as any).playAnimation = (
  fromId: string,
  toId: string,
  cardName?: string,
  cardIndex?: number,
  durationMs = 500
) => {
  const card = cardName ? { name: cardName, index: cardIndex ?? 0 } : null;
  animationManager.playAnimation(fromId, toId, card, durationMs);
};
