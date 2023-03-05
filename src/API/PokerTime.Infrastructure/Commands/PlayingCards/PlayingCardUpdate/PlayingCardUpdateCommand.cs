using System;
using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardUpdate;

public class PlayingCardUpdateCommand : UserBasedCommand<PlayingCardUpdateCommandResponse>
{
    [Required] [MaxLength(3)] public string Content { get; set; }

    [Required] [MaxLength(7)] public string Color { get; set; }

    [Required] public Guid CardId { get; set; }
}

public class PlayingCardUpdateCommandResponse
{
    public bool HasReceivedCardDeck { get; set; }
}