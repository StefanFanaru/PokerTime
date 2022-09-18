using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class PauseToggledEvent : IClientEvent
{
    public bool IsPaused { get; set; }
    public ClientEventType Type => ClientEventType.PauseToggled;
}