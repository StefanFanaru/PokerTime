using System.Text.Json.Serialization;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class CardDeselectedEvent : IClientEvent
{
    public string PlayerId { get; set; }
    public string RoundId { get; set; }

    [JsonIgnore] public ClientEventType Type => ClientEventType.CardDeselected;
}