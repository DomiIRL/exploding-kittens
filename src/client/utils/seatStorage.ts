export interface Seat {
  playerID: string;
  credentials: string;
}

const key = (matchID: string) => `seat:${matchID}`;

// Lets a reload or a reopened invite link take back the player's own seat instead of joining a second time.
export const saveSeat = (matchID: string, seat: Seat) => {
  try {
    localStorage.setItem(key(matchID), JSON.stringify(seat));
  } catch {
    // Storage blocked: the player simply joins as new after a reload.
  }
};

export const loadSeat = (matchID: string): Seat | null => {
  try {
    const raw = localStorage.getItem(key(matchID));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const forgetSeat = (matchID: string) => {
  try {
    localStorage.removeItem(key(matchID));
  } catch {
    // Nothing stored.
  }
};
