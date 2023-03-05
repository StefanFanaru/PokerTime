using System.ComponentModel.DataAnnotations;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardUpdateIndexes;

public class PlayingCardUpdateIndexesCommand : UserBasedCommand<PlayingCardUpdateIndexesCommandResponse>
{
    [Required] public List<string> PlayingCardIdsOrdered { get; set; }
}

public class PlayingCardUpdateIndexesCommandResponse
{
    public bool HasReceivedCardDeck { get; set; }
}