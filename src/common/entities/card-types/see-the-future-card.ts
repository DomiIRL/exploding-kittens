import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class SeeTheFutureCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Set stage to view the future
    game.turnManager.setStage("viewingFuture")
  }


  sortOrder(): number {
    return 5;
  }
}
