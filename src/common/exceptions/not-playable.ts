export class NotPlayable extends Error {
  constructor() {
    super('Card currently not playable.');
  }
}