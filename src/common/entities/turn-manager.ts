import {IContext} from "../models";
import {Player} from "./player";
import {PlayerID} from "boardgame.io";

export class TurnManager {
  constructor(private context: IContext) {}

  get turnsRemaining(): number {
    return this.context.G.turnsRemaining;
  }

  set turnsRemaining(value: number) {
    this.context.G.turnsRemaining = value;
  }

  get playOrder(): PlayerID[] {
    return this.context.ctx.playOrder;
  }

  get playOrderPos(): number {
    return this.context.ctx.playOrderPos;
  }

  get activePlayers(): Record<string, string> | null {
    return this.context.ctx.activePlayers as Record<string, string> | null;
  }

  isInStage(player: Player | PlayerID, stage: string): boolean {
    const playerId = typeof player === 'string' ? player : player.id;
    return this.activePlayers?.[playerId] === stage;
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

