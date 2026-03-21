import type {ICard} from '../models';
import {TheGame} from './game';
import {Card} from './card';
import {AWAITING_NOW_CARDS, RESPOND_WITH_NOW_CARD} from "../constants/stages";

export class CardType {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  inTesting(): boolean {
    return false;
  }

  createCard(index: number): ICard {
    return {name: this.name, index};
  }

  canBePlayed(_game: TheGame, _card: Card): boolean {
    return true;
  }

  isNowCard(): boolean {
    return false;
  }


  setupPendingState(game: TheGame) {
    game.turnManager.setActivePlayers({
      currentPlayer: AWAITING_NOW_CARDS,
      others: {
        stage: RESPOND_WITH_NOW_CARD,
      },
    });
  }

  cleanupPendingState(game: TheGame) {
    game.turnManager.endStage();
    game.turnManager.setActivePlayers({value: {}});
  }

  afterPlay(_game: TheGame, _card: Card): void {}

  onPlayed(_game: TheGame, _card: Card): void {}


  /**
   * Returns the sort order for this card type.
   */
  sortOrder(): number {
    return 100;
  }

}
