import type {ICard, IContext} from '../models';

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

  canBePlayed(_context: IContext, _card: ICard): boolean {
    return true;
  }

  isNowCard(_context: IContext, _card: ICard): boolean {
    return false;
  }


  setupPendingState(context: IContext) {
    context.events.setActivePlayers({
      currentPlayer: 'awaitingNowCards',
      others: {
        stage: 'respondWithNowCard',
      },
    });
  }

  cleanupPendingState(context: IContext) {
    const { events } = context;
    events.endStage();
    events.setActivePlayers({value: {}});
  }

  afterPlay(_context: IContext, _card: ICard): void {}

  onPlayed(_context: IContext, _card: ICard): void {}

  /**
   * Returns the sort order for this card type.
   */
  sortOrder(): number {
    return 100;
  }

}
