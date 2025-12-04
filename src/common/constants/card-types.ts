import {CardType} from '../entities/card-type';
import {DefuseCard} from '../entities/cards/defuse-card';
import {CatCard} from '../entities/cards/cat-card';
import {ExplodingKittenCard} from '../entities/cards/exploding-kitten-card';
import {SkipCard} from "../entities/cards/skip-card";
import {ShuffleCard} from "../entities/cards/shuffle-card";
import {Registry} from "../registry/registry";
import {AttackCard} from "../entities/cards/attack-card";

// Registry for card types
export const cardTypeRegistry = new Registry<CardType>();

// Card instances
export const ATTACK = register(new AttackCard('attack'));
export const CAT_CARD = register(new CatCard('cat_card'));
export const SKIP = register(new SkipCard('skip'));
export const SHUFFLE = register(new ShuffleCard('shuffle'));
export const FAVOR = register(new CardType('favor'));
export const NOPE = register(new CardType('nope'));
export const SEE_THE_FUTURE = register(new CardType('see_the_future'));
export const DEFUSE = register(new DefuseCard('defuse'));
export const EXPLODING_KITTEN = register(new ExplodingKittenCard('exploding_kitten'));

function register(cardType: CardType): CardType {
  return cardTypeRegistry.register(cardType);
}
