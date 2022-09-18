using System;
using System.Collections.Generic;

namespace PokerTime.Core.Entities
{
    public class Player : Entity<string>
    {
        public Player(string id, string name, string email) : base(id)
        {
            Name = name;
            Email = email;
            CreatedAt = DateTime.UtcNow;
        }

        public string Name { get; }
        public string Email { get; }
        public DateTime CreatedAt { get; }
        public DateTime LastConnectedAt { get; set; }
        public List<GameRoundPlayer> PlayedRounds { get; set; }
        public List<PlayedCard> PlayedCards { get; set; }
    }
}