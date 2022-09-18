using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents;

public class ReceivedEvent
{
    public ClientEventType Type { get; set; }
    public string Payload { get; set; }
}