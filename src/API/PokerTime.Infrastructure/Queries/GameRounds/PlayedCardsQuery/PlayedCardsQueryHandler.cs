using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Queries.GameRounds.PlayedCardsQuery;

public class PlayedCardsQueryHandler : IRequestHandler<PlayedCardsQuery, IOperationResult<List<PlayedCardsDto>>>
{
    private readonly IRepository _repository;

    public PlayedCardsQueryHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<List<PlayedCardsDto>>> Handle(PlayedCardsQuery request,
        CancellationToken cancellationToken)
    {
        var cards = await _repository.Query<PlayedCard>()
            .Where(x => x.RoundId == request.RoundId)
            .Select(x => new PlayedCardsDto
            {
                CardId = x.PlayingCardId,
                PlayerId = x.PlayerId,
                Content = x.Round.CardsWereFlipped ? x.PlayingCard.Content : null,
                Color = x.Round.CardsWereFlipped ? x.PlayingCard.Color : null
            })
            .ToListAsync(cancellationToken);

        var currentPlayerCared = cards.FirstOrDefault(x => x.PlayerId == request.User.Id);
        if (currentPlayerCared != null)
        {
            cards.Remove(currentPlayerCared);
            cards.Insert(0, currentPlayerCared);
        }

        return ResultBuilder.Ok(cards);
    }
}