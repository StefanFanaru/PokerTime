using System.Text.Json.Serialization;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class PlayerConnectedEvent : IClientEvent
{
    public string PlayerId { get; set; }

    [JsonIgnore] public ClientEventType Type => ClientEventType.PlayerConnected;
}