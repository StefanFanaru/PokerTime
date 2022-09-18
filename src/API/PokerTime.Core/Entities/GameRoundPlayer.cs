namespace PokerTime.Core.Entities
{
    public class GameRoundPlayer
    {
        public GameRoundPlayer(string roundId, string playerId)
        {
            RoundId = roundId;
            PlayerId = playerId;
        }

        public string RoundId { get; }
        public GameRound Round { get; set; }
        public string PlayerId { get; }
        public Player Player { get; set; }
    }
}