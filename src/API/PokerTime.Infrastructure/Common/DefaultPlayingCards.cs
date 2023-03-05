using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Common;

public static class DefaultPlayingCards
{
    public static List<PlayingCard> List()
    {
        return new List<PlayingCard>
        {
            new("1", "#354e4f", 1, true),
            new("2", "#354e4f", 2, true),
            new("3", "#354e4f", 3, true),
            new("5", "#1c3d3d", 4, true),
            new("8", "#1c3d3d", 5, true),
            new("13", "#1c3d3d", 6, true),
            new("21", "#6a3624", 7, true),
            new("34", "#6a3624", 8, true),
            new("55", "#6a3624", 9, true),
            new("89", "#6a3624", 10, true),
            new("?", "#78604b", 11, true),
            new("☕", "#78604b", 12, true)
        };
    }
}