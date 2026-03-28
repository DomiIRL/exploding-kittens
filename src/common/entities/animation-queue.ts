import {IAnimation, IAnimationQueue, ICard} from "../models";
import {Player} from "./player";
import {Pile} from "./pile";
import {Card} from "./card";
import type {PlayerID} from "boardgame.io";

export class AnimationQueue {

  constructor(public readonly queue: IAnimationQueue) {
  }

  enqueue(card: Card | ICard, from: Player | Pile, to: Player | Pile, options?: { visibleTo?: (Player | PlayerID)[], durationMs?: number }) {
    const { visibleTo = [], durationMs = 500 } = options || {};
    const idVisibleTo: PlayerID[] = visibleTo.map(player => {
      return player instanceof Player ? player.id : player;
    });

    const animation: IAnimation = {
      from: from instanceof Player ? from.id : from.name,
      to: to instanceof Player ? to.id : to.name,
      card: {
        id: 'id' in card ? card.id : -1,
        name: card.name,
        index: card.index
      },
      visibleTo: idVisibleTo,
      durationMs
    };
    this.enqueueAnimation(animation);
  }

  enqueueAnimationWithDelay(animation: IAnimation, options?: { delayMs?: number }) {
    const delayMs = options?.delayMs || 0;
    const id = Date.now() + delayMs;
    let currentQueue = this.queue[id];
    if (!currentQueue) {
      currentQueue = []
      this.queue[id] = currentQueue
    }
    currentQueue.push(animation)
  }

  enqueueAnimation(animation: IAnimation) {
    this.enqueueAnimationWithDelay(animation, { delayMs: 0 });
  }

  getAnimationsToPlay(lastTimePlayed: number): [number, {id: number, animation: IAnimation}[]] {
    const animationsToPlay: {id: number, animation: IAnimation}[] = []
    let highestTime: number = lastTimePlayed
    let uniqueCounter = 0;
    for (let id of Object.keys(this.queue).map(Number)) {
      if (id > lastTimePlayed) {
        const animations = this.queue[id];
        if (animations) {
          if (id > highestTime) {
            highestTime = id;
          }
          animations.forEach(anim => {
            animationsToPlay.push({id: id + uniqueCounter, animation: anim});
            uniqueCounter += 0.001; // ensure unique ids even if same timestamp
          });
        }
      }
    }
    // Sort animations by time
    animationsToPlay.sort((a, b) => a.id - b.id);
    return [highestTime, animationsToPlay]
  }

  clear() {
    for (const key in this.queue) {
      delete this.queue[key];
    }
  }
}