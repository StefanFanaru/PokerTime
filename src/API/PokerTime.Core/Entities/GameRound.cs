using System;
using System.Collections.Generic;

namespace PokerTime.Core.Entities
{
    public class GameRound : Entity<string>
    {
        public GameRound(string gameId, int workItemId) : base(Guid.NewGuid().ToString())
        {
            GameId = gameId;
            WorkItemId = workItemId;
        }

        public GameRound()
        {
        }

        public string GameId { get; }
        public Game Game { get; set; }
        public int WorkItemId { get; }
        public DateTime CreatedAt { get; set; }
        public float? SubmittedStoryPoints { get; set; }
        public bool CardsWereFlipped { get; set; }
        public List<GameRoundPlayer> Players { get; set; }
        public List<PlayedCard> PlayedCards { get; set; }
    }
}