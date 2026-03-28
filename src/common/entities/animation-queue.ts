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
    const id = Date.now();
    let currentQueue = this.queue.get(id);
    if (!currentQueue) {
      currentQueue = []
      this.queue.set(id, [])
    }
    currentQueue.push(animation)
  }

  getAnimationsToPlay(lastTimePlayed: number): [number, IAnimation[]] {
    const animationsToPlay: IAnimation[] = []
    let highestTime: number = lastTimePlayed
    for (let id of this.queue.keys()) {
      if (id > lastTimePlayed) {
        const animations = this.queue.get(id);
        if (animations) {
          if (id > highestTime) {
            highestTime = id;
          }
          animations.forEach(anim => animationsToPlay.push(anim));
        }
      }
    }
    return [highestTime, animationsToPlay]
  }

  clear() {
    this.queue.clear();
  }
}