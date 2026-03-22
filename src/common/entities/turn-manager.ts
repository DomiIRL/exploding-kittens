import {IContext} from "../models";

export class TurnManager {
  constructor(private context: IContext) {}

  get turnsRemaining(): number {
    return this.context.G.turnsRemaining;
  }

  set turnsRemaining(value: number) {
    this.context.G.turnsRemaining = value;
  }

  endTurn(arg?: any): void {
    this.context.events.endTurn(arg);
  }

  setStage(stage: string): void {
    this.context.events.setStage(stage);
  }

  endStage(): void {
    this.context.events.endStage();
  }

  setActivePlayers(arg: any): void {
    this.context.events.setActivePlayers(arg);
  }
}

