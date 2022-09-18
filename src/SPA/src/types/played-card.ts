export interface IPlayedCard {
  cardId?: string;
  playerId: string;
  isAway: boolean;
  avatarBase64: string;
  content?: string;
  userName: string;
  color?: string;
}
