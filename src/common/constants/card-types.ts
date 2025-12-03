import {CardType} from '../entities/card-type';
import {DefuseCard} from '../entities/cards/defuse-card';
import {CatCard} from '../entities/cards/cat-card';
import {ExplodingKittenCard} from '../entities/cards/exploding-kitten-card';

export const ATTACK = new CardType('attack');
export const CAT_CARD = new CatCard('cat_card');
export const SKIP = new CardType('skip');
export const SHUFFLE = new CardType('shuffle');
export const FAVOR = new CardType('favor');
export const NOPE = new CardType('nope');
export const SEE_THE_FUTURE = new CardType('see_the_future');
export const DEFUSE = new DefuseCard();
export const EXPLODING_KITTEN = new ExplodingKittenCard();
