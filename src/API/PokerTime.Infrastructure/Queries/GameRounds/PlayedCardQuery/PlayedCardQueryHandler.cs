using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Queries.GameRounds.PlayedCardQuery;

public class PlayedCardQueryHandler : IRequestHandler<PlayedCardQuery, IOperationResult<PlayedCardDto>>
{
    private readonly IRepository _repository;

    public PlayedCardQueryHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<PlayedCardDto>> Handle(PlayedCardQuery request, CancellationToken cancellationToken)
    {
        var card = await _repository.Query<PlayedCard>()
            .Where(x => x.RoundId == request.RoundId)
            .Where(x => x.Player.Id == request.User.Id)
            .Select(x => new PlayedCardDto
            {
                CardId = x.PlayingCardId
            })
            .FirstOrDefaultAsync(cancellationToken);

        return ResultBuilder.Ok(card);
    }
}