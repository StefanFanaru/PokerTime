using System.Text.Json.Serialization;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class WorkItemSelectedEvent : IClientEvent
{
    public int WorkItemId { get; set; }
    public string GameId { get; set; }

    [JsonIgnore] public ClientEventType Type => ClientEventType.WorkItemSelected;
}