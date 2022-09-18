using System;

namespace PokerTime.Core.Entities
{
    public class PlayedCard : Entity<string>
    {
        public PlayedCard(string playingCardId, string playerId, string roundId) : base(Guid.NewGuid().ToString())
        {
            PlayingCardId = playingCardId;
            PlayerId = playerId;
            RoundId = roundId;
            PlayedAt = DateTime.UtcNow;
        }

        public string PlayingCardId { get; set; }
        public PlayingCard PlayingCard { get; set; }
        public string PlayerId { get; }
        public Player Player { get; set; }
        public string RoundId { get; }
        public GameRound Round { get; set; }
        public DateTime PlayedAt { get; set; }
    }
}