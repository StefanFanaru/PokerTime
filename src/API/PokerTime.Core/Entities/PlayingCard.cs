using System;

namespace PokerTime.Core.Entities
{
    public class PlayingCard : Entity<string>
    {
        public PlayingCard(string content, string color, int index) : base(Guid.NewGuid().ToString())
        {
            Content = content;
            Color = color;
            Index = index;
        }

        public string Content { get; set; }
        public string Color { get; set; }
        public int Index { get; set; }
    }
}