import {TheGame} from "./game";

export class TurnManager {
  constructor(private game: TheGame) {}

  get turnsRemaining(): number {
    return this.game.context.G.turnsRemaining;
  }

  set turnsRemaining(value: number) {
    this.game.context.G.turnsRemaining = value;
  }

  endTurn(arg?: any): void {
    this.game.context.events.endTurn(arg);
  }

  setStage(stage: string): void {
    this.game.context.events.setStage(stage);
  }

  endStage(): void {
    this.game.context.events.endStage();
  }

  setActivePlayers(arg: any): void {
    this.game.context.events.setActivePlayers(arg);
  }
}

