using System;
using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardDelete;

public class PlayingCardDeleteCommand : UserBasedCommand<PlayingCardDeleteCommandResponse>
{
    [Required] public Guid PlayingCardId { get; set; }
    [Required] public List<string> PlayingCardIdsOrdered { get; set; }
}

public class PlayingCardDeleteCommandResponse
{
    public bool HasReceivedCardDeck { get; set; }
}