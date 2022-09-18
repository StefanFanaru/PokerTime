using PokerTime.Core.Enums;

namespace PokerTime.Core.Abstractions
{
    public interface IClientEvent
    {
        public ClientEventType Type { get; }
    }
}