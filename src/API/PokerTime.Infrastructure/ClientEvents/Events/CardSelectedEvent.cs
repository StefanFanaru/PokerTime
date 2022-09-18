using System.Text.Json.Serialization;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class CardSelectedEvent : IClientEvent
{
    public string PlayerId { get; set; }
    public string RoundId { get; set; }
    public string GameId { get; set; }
    public string PlayingCardId { get; set; }
    public string Content { get; set; }
    public string Color { get; set; }

    [JsonIgnore] public ClientEventType Type => ClientEventType.CardSelected;
}