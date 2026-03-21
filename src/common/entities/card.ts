import {ICard} from '../models';
import {TheGame} from './game';
import {cardTypeRegistry} from '../registries/card-registry';
import {CardType} from './card-type';

export class Card {
  public name: string;
  public index: number;

  constructor(
    private game: TheGame,
    _data: ICard
  ) {
    this.name = _data.name;
    this.index = _data.index;
  }

  get data(): ICard {
    return {name: this.name, index: this.index};
  }

  get type(): CardType {
    const t = cardTypeRegistry.get(this.name);
    if (!t) throw new Error(`Unknown card type: ${this.name}`);
    return t;
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

