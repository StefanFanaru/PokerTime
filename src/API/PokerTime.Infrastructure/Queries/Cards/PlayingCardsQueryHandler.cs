using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Queries.Cards;

public class PlayingCardsQueryHandler : IRequestHandler<PlayingCardsQuery, IOperationResult<PlayingCardDto[]>>
{
    private readonly IRepository _repository;

    public PlayingCardsQueryHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<PlayingCardDto[]>> Handle(PlayingCardsQuery request, CancellationToken cancellationToken)
    {
        var cardDtos = await _repository.Query<PlayingCard>()
            .OrderBy(x => x.Index)
            .Select(x => new PlayingCardDto
            {
                Id = x.Id,
                Content = x.Content,
                Color = x.Color
            })
            .ToArrayAsync(cancellationToken);

        return ResultBuilder.Ok(cardDtos);
    }
}