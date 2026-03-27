import {IAnimation, IAnimationQueue, ICard} from "../models";
import {Player} from "./player.ts";
import {Pile} from "./pile.ts";
import {Card} from "./card.ts";

export class AnimationQueue {

  constructor(public readonly queue: IAnimationQueue) {
  }

  enqueue(card: Card | ICard, from: Player | Pile, to: Player | Pile, durationMs: number = 500) {
    const animation: IAnimation = {
      from: from instanceof Player ? `${from.id}` : `${from.name}`,
      to: to instanceof Player ? `${to.id}` : `${to.name}`,
      card: {name: card.name, index: card.index},
      durationMs
    };
    this.enqueueAnimation(animation);
  }

  enqueueAnimation(animation: IAnimation) {
    // generate a number unique id
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    this.queue[id] = animation;
  }

  clear(animationId: string) {
    delete this.queue[animationId];
  }

  getAnimations(): IAnimation[] {
    return Object.values(this.queue);
  }
  
}