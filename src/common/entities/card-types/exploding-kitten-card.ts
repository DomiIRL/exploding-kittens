import {CardType} from '../card-type';

export class ExplodingKittenCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  sortOrder(): number {
    return 0;
  }
}
