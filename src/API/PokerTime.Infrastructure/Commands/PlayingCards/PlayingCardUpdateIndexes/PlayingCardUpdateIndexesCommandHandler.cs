using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Common;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardUpdateIndexes;

public class PlayingCardUpdateIndexesCommandHandler : IRequestHandler<PlayingCardUpdateIndexesCommand, IOperationResult<
    PlayingCardUpdateIndexesCommandResponse>>
{
    private readonly PlayingCardsUpdateIndexesService _playingCardsUpdateIndexesService;
    private readonly IRepository _repository;

    public PlayingCardUpdateIndexesCommandHandler(PlayingCardsUpdateIndexesService playingCardsUpdateIndexesService,
        IRepository repository)
    {
        _playingCardsUpdateIndexesService = playingCardsUpdateIndexesService;
        _repository = repository;
    }

    public async Task<IOperationResult<PlayingCardUpdateIndexesCommandResponse>> Handle(PlayingCardUpdateIndexesCommand request,
        CancellationToken cancellationToken)
    {
        var response = new PlayingCardUpdateIndexesCommandResponse();
        var hasCards = await _repository.Query<PlayingCard>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .AnyAsync(cancellationToken);

        if (hasCards)
        {
            await _playingCardsUpdateIndexesService.Update(request.PlayingCardIdsOrdered, request.User.OrganizationId,
                cancellationToken);

            return ResultBuilder.Ok(response);
        }

        var defaultCardsEntities = await _repository.Query<PlayingCard>()
            .Where(x => x.IsDefault).Select(x => new { x.Id, x.Content }).ToListAsync(cancellationToken);

        var defaultCards = DefaultPlayingCards.List();
        defaultCards.ForEach(x =>
        {
            var defaultCardId = defaultCardsEntities.Find(y => y.Content == x.Content).Id;
            x.Index = request.PlayingCardIdsOrdered.FindIndex(y => y == defaultCardId);
            x.IsDefault = false;
            x.OrganizationId = request.User.OrganizationId;
        });

        await _repository.InsertRangeAsync(defaultCards);
        await _repository.SaveAsync(cancellationToken);
        response.HasReceivedCardDeck = true;
        return ResultBuilder.Ok(response);
    }
}