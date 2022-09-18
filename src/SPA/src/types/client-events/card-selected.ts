export interface ICardSelectedEvent {
  gameId: string;
  playerId: string;
  playingCardId?: string;
  roundId: string;
  content?: string;
  color?: string;
}
