import type {IContext} from "../models";

/**
 * Close the see the future overlay
 */
export const closeFutureView = (context: IContext) => {
  const {events} = context;

  // End the viewing stage
  events.endStage();
};

