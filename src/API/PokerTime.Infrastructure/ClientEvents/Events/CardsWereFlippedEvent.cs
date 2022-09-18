using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.Commands.GameRounds.FlipCards;

namespace PokerTime.Infrastructure.ClientEvents.Events;

public class CardsWereFlippedEvent : IClientEvent
{
    public List<PlayedCardDto> Cards { get; set; }
    public ClientEventType Type => ClientEventType.CardsWereFlipped;
}