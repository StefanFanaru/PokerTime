using System.Text.Json.Serialization;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class RoundStoryPointsSetEvent : IClientEvent
{
    public int SubmittedStoryPoints { get; set; }
    public int WorkItemId { get; set; }

    [JsonIgnore] public ClientEventType Type => ClientEventType.RoundStoryPointsSet;
}