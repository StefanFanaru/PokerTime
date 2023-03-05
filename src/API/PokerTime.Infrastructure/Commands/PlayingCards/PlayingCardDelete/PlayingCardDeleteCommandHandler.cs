using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Common;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardDelete;

public class PlayingCardDeleteCommandHandler : IRequestHandler<PlayingCardDeleteCommand, IOperationResult<
    PlayingCardDeleteCommandResponse>>
{
    private readonly PlayingCardsUpdateIndexesService _playingCardsUpdateIndexesService;
    private readonly IRepository _repository;

    public PlayingCardDeleteCommandHandler(IRepository repository,
        PlayingCardsUpdateIndexesService playingCardsUpdateIndexesService)
    {
        _repository = repository;
        _playingCardsUpdateIndexesService = playingCardsUpdateIndexesService;
    }

    public async Task<IOperationResult<PlayingCardDeleteCommandResponse>> Handle(PlayingCardDeleteCommand request,
        CancellationToken cancellationToken)
    {
        var affected = 0;
        var response = new PlayingCardDeleteCommandResponse();
        await _repository.ExecuteTransactionalAsync(async () =>
        {
            var defaultCard = await _repository.Query<PlayingCard>()
                .Where(x => x.Id == request.PlayingCardId.ToString() && x.IsDefault)
                .FirstOrDefaultAsync(cancellationToken);

            if (defaultCard != null)
            {
                var defaultCards = DefaultPlayingCards.List()
                    .Where(x => x.Content != defaultCard.Content).ToList();
                defaultCards.ForEach(x =>
                {
                    x.IsDefault = false;
                    x.OrganizationId = request.User.OrganizationId;
                });

                await _repository.InsertRangeAsync(defaultCards);
                await _repository.SaveAsync(cancellationToken);
                affected = defaultCards.Count;
                response.HasReceivedCardDeck = true;
            }
            else
            {
                affected = await _repository.Query<PlayingCard>()
                    .Where(x => x.OrganizationId == request.User.OrganizationId)
                    .Where(x => x.Id == request.PlayingCardId.ToString())
                    .UpdateFromQueryAsync(x => new PlayingCard { IsDeleted = true }, cancellationToken);
                await _playingCardsUpdateIndexesService.Update(request.PlayingCardIdsOrdered, request.User.OrganizationId,
                    cancellationToken);
            }
        });

        return affected == 0 ? ResultBuilder.NotFound<PlayingCardDeleteCommandResponse>() : ResultBuilder.Ok(response);
    }
}