using System;

namespace PokerTime.Core.Entities
{
    public class PlayingCard : Entity<string>
    {
        public PlayingCard(string content, string color, int index, bool isDefault) : base(Guid.NewGuid().ToString())
        {
            Content = content;
            Color = color;
            Index = index;
            IsDefault = isDefault;
        }

        public PlayingCard()
        {
        }

        public string Content { get; set; }
        public string Color { get; set; }
        public string OrganizationId { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsDefault { get; set; }
        public bool IsLegacy { get; set; }
        public int Index { get; set; }
    }
}