using System.Text.Json.Serialization;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class GameEndedEvent : IClientEvent
{
    [JsonIgnore] public ClientEventType Type => ClientEventType.GameEnded;
}