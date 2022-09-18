export interface IGameRoundInsertResponse {
  roundId: string;
  submittedStoryPoints: number;
  cardsWereFlipped: boolean;
  workItemId: number;
  activePlayersIds: string[];
}
