import {IAnimation, IAnimationQueue, ICard} from "../models";
import {Player} from "./player";
import {Pile} from "./pile";
import {Card} from "./card";

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
    const id = Date.now() + Math.random();
    this.queue[id.toString()] = animation;
  }

  clear() {
    for (let id in this.queue) {
      delete this.queue[id];
    }
  }

  getAnimations(): IAnimation[] {
    return Object.values(this.queue);
  }

}