using System.Text.Json.Serialization;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class ShouldRefreshGameEvent : IClientEvent
{
    public string PlayerId { get; set; }
    public string GameId { get; set; }

    [JsonIgnore] public ClientEventType Type => ClientEventType.ShouldRefreshGame;
}