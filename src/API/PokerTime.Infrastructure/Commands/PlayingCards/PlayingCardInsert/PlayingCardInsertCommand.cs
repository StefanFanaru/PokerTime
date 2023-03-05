using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardInsert;

public class PlayingCardInsertCommand : UserBasedCommand<PlayingCardInsertCommandResponse>
{
    [Required] [MaxLength(3)] public string Content { get; set; }

    [Required] [MaxLength(7)] public string Color { get; set; }
}

public class PlayingCardInsertCommandResponse
{
    public bool HasReceivedCardDeck { get; set; }
    public string CardId { get; set; }
}