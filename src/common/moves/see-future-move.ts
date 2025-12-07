import type {FnContext} from "../models";

/**
 * Close the see the future overlay
 */
export const closeFutureView = (context: FnContext) => {
  const {events} = context;

  // End the viewing stage
  events.endStage();
};

