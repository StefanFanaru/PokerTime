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
            .Where(x => x.OrganizationId == request.User.OrganizationId || x.IsDefault)
            .Where(x => !x.IsDeleted && !x.IsLegacy)
            .OrderBy(x => x.Index)
            .Select(x => new
            {
                IsOwned = x.OrganizationId == request.User.OrganizationId,
                Card = new PlayingCardDto
                {
                    Id = x.Id,
                    Content = x.Content,
                    Color = x.Color
                }
            })
            .ToArrayAsync(cancellationToken);

        if (cardDtos.Any(x => x.IsOwned))
        {
            var result = cardDtos.Where(x => x.IsOwned).Select(x => x.Card).ToArray();
            return ResultBuilder.Ok(result);
        }

        return ResultBuilder.Ok(cardDtos.Select(x => x.Card).ToArray());
    }
}