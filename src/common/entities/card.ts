import {ICard} from '../models';
import {TheGame} from './game';
import {cardTypeRegistry} from '../registries/card-registry';
import {CardType} from './card-type';
import {Player} from "./player";
import {Pile} from "./pile";
import type {PlayerID} from "boardgame.io";

export class Card {
  public id: number;
  public name: string;
  public index: number;

  constructor(
    private game: TheGame,
    _data: ICard
  ) {
    this.id = _data.id;
    this.name = _data.name;
    this.index = _data.index;
  }

  get data(): ICard {
    return {id: this.id, name: this.name, index: this.index};
  }

  get type(): CardType {
    const t = cardTypeRegistry.get(this.name);
    if (!t) throw new Error(`Unknown card type: ${this.name}`);
    return t;
  }

  moveTo(destination: Player | Pile, options?: { visibleTo?: PlayerID[], delayMs?: number, insertIndex?: number }): void {
    const { visibleTo, delayMs, insertIndex } = options || {};
    
    const removal = this.game.findAndRemoveCardById(this.id);
    if (!removal) {
      console.error(`Could not find card ${this.name} (${this.id}) to move.`);
      return;
    }
    const { card: cardData, source } = removal;

    // Add to destination
    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= destination.length) {
      destination.insertCard(cardData, insertIndex);
    } else {
      destination.addCard(cardData);
    }

    // Determine visibility
    let finalVisibleTo: PlayerID[] = [];
    if (visibleTo !== undefined) {
      finalVisibleTo = visibleTo;
    } else {
      // Default inference
      if (destination instanceof Player) {
        finalVisibleTo = [destination.id];
        // If moving between players, make it visible to both
        for (const p of this.game.players.allPlayers) {
          if (p.id === source) {
            finalVisibleTo.push(source);
          }
        }
      }
    }

    // Enqueue animation
    // Note: since source is string and destination is Player|Pile, we adapt enqueue
    const toStr = destination instanceof Player ? destination.id : destination.name;
    
    const animation = {
      from: source,
      to: toStr,
      card: cardData,
      visibleTo: finalVisibleTo,
      durationMs: 500
    };
    this.game.animationsQueue.enqueueAnimationWithDelay(animation, { delayMs: delayMs || 0 });
  }

  canPlay(): boolean {
    return this.type.canBePlayed(this.game, this);
  }

  play(): void {
    this.type.onPlayed(this.game, this);
  }

  afterPlay(): void {
    this.type.afterPlay(this.game, this);
  }
}
