import { CardType } from '../entities/card-type';
import { DefuseCard } from '../entities/cards/defuse-card';
import { CatCard } from '../entities/cards/cat-card';
import { ExplodingKittenCard } from '../entities/cards/exploding-kitten-card';

export const ATTACK = new CardType('attack');
export const SKIP = new CardType('skip');
export const SHUFFLE = new CardType('shuffle');
export const FAVOR = new CardType('favor');
export const NOPE = new CardType('nope');
export const SEE_THE_FUTURE = new CardType('see_the_future');
export const CAT_BEARD = new CatCard('cat_beard');
export const CAT_RAINBOW = new CatCard('cat_rainbow');
export const CAT_TACO = new CatCard('cat_taco');
export const CAT_MELON = new CatCard('cat_melon');
export const CAT_HAIRY = new CatCard('cat_hairy');
export const DEFUSE = new DefuseCard();
export const EXPLODING_KITTEN = new ExplodingKittenCard();
