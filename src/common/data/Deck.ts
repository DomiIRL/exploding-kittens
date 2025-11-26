import { Card } from './CardType';

export class Deck {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  create_initial_deck(_deck: Card[]): void {
    throw new Error("create_initial_deck() must be implemented by subclass");
  }

  get_initial_hand_size(): number {
    throw new Error("get_initial_hand_size() must be implemented by subclass");
  }

  add_post_cards(_deck: Card[], _playerCount: number): void {
    throw new Error("add_post_cards() must be implemented by subclass");
  }
}

export interface OriginalDeckCard {
  name: string;
  count: number;
}

export const ORIGINAL_DECK: OriginalDeckCard[] = [
  { name: 'Angriff', count: 4 },
  { name: 'Hops', count: 4 },
  { name: 'Mischen', count: 4 },
  { name: 'Wunsch', count: 4 },
  { name: 'Nö', count: 5 },
  { name: 'Blick in die Zukunft', count: 5 },
  { name: 'Baratze', count: 4 },
  { name: 'Regenbogen-Rülpsende Katze', count: 4 },
  { name: 'Tacocat', count: 4 },
  { name: 'Katzelone', count: 4 },
  { name: 'Behaarte Katze', count: 4 },
];

export const SPECIAL_CARDS = {
  DEFUSE: 'Entschärfung',
  EXPLODING_KITTEN: 'Exploding Kitten',
} as const;

export const GAME_CONSTANTS = {
  STARTING_HAND_SIZE: 7,
  TOTAL_DEFUSE_CARDS: 6,
  MAX_DECK_DEFUSE_CARDS: 2,
} as const;

