import {IAnimation, IAnimationQueue, ICard} from "../models";
import {Player} from "./player";
import {Pile} from "./pile";
import {Card} from "./card";
import type {PlayerID} from "boardgame.io";

export class AnimationQueue {

  constructor(public readonly queue: IAnimationQueue) {
  }

  enqueue(card: Card | ICard, from: Player | Pile, to: Player | Pile, visibleTo: (Player | PlayerID)[] = [], durationMs: number = 500) {
    const idVisibleTo: PlayerID[] = visibleTo.map(player => {
      return player instanceof Player ? player.id : player;
    });

    const animation: IAnimation = {
      from: from instanceof Player ? from.id : from.name,
      to: to instanceof Player ? to.id : to.name,
      card: {name: card.name, index: card.index},
      visibleTo: idVisibleTo,
      durationMs
    };
    this.enqueueAnimation(animation);
  }

  enqueueAnimation(animation: IAnimation) {
    // generate a number unique id
    const id = Date.now();
    let currentQueue = this.queue[id];
    if (!currentQueue) {
      currentQueue = []
      this.queue[id] = currentQueue
    }
    currentQueue.push(animation)
  }

  getAnimationsToPlay(lastTimePlayed: number): [number, IAnimation[]] {
    const animationsToPlay: IAnimation[] = []
    let highestTime: number = lastTimePlayed
    for (let id of Object.keys(this.queue).map(Number)) {
      if (id > lastTimePlayed) {
        const animations = this.queue[id];
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
    for (const key in this.queue) {
      delete this.queue[key];
    }
  }
}