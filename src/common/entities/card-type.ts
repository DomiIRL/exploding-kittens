import type {ICard} from '../models';
import {TheGame} from './game';
import {Card} from './card';

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

  isNowCard(_game: TheGame, _card: Card): boolean {
    return false;
  }


  setupPendingState(game: TheGame) {
    game.turnManager.setActivePlayers({
      currentPlayer: 'awaitingNowCards',
      others: {
        stage: 'respondWithNowCard',
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
