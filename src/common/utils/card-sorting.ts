import type {Card} from '../models';
import {cardTypeRegistry} from '../constants/card-types';

/**
 * Sorts cards by card type sort order and card index
 * @param cards Array of cards to sort
 * @returns Sorted array of cards (does not mutate original array)
 */
export function sortCards<T extends Card>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    const cardTypeA = cardTypeRegistry.get(a.name);
    const cardTypeB = cardTypeRegistry.get(b.name);

    const sortOrderA = cardTypeA?.sortOrder() ?? 100;
    const sortOrderB = cardTypeB?.sortOrder() ?? 100;

    if (sortOrderA !== sortOrderB) {
      return sortOrderA - sortOrderB;
    }

    return a.index - b.index;
  });
}

