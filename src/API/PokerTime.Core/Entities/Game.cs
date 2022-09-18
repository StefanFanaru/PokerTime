using System;
using System.Collections.Generic;
using PokerTime.Core.Enums;

namespace PokerTime.Core.Entities
{
    public class Game : Entity<string>
    {
        public Game() : base(Guid.NewGuid().ToString())
        {
            CreatedAt = DateTime.UtcNow;
            Status = GameStatus.Active;
        }

        public string IterationId { get; set; }
        public string IterationName { get; set; }
        public string TeamId { get; set; }
        public string TeamName { get; set; }
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string GameTitle { get; set; }
        public string OwnerId { get; set; }
        public DateTime CreatedAt { get; }
        public DateTime? EndedAt { get; set; }
        public GameStatus Status { get; set; }
        public string OrganizationId { get; set; }
        public float? Velocity { get; set; }
        public int? ActiveWorkItemId { get; set; }
        public List<GameRound> Rounds { get; set; }
    }
}