using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Common;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardUpdate;

public class PlayingCardUpdateCommandHandler : IRequestHandler<PlayingCardUpdateCommand, IOperationResult<
    PlayingCardUpdateCommandResponse>>
{
    private readonly IRepository _repository;

    public PlayingCardUpdateCommandHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<PlayingCardUpdateCommandResponse>> Handle(PlayingCardUpdateCommand request,
        CancellationToken cancellationToken)
    {
        var response = new PlayingCardUpdateCommandResponse();
        var hasCards = await _repository.Query<PlayingCard>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .AnyAsync(cancellationToken);

        if (hasCards)
        {
            var query = _repository.Query<PlayingCard>()
                .Where(x => x.Id == request.CardId.ToString())
                .Where(x => x.OrganizationId == request.User.OrganizationId);
            var isUsed = await _repository.Query<PlayedCard>()
                .Where(x => x.PlayingCardId == request.CardId.ToString())
                .AnyAsync(cancellationToken);

            if (isUsed)
            {
                var legacyCard = await query.FirstOrDefaultAsync(cancellationToken);

                var newCard = new PlayingCard
                {
                    Id = Guid.NewGuid().ToString(),
                    Color = legacyCard.Color,
                    Content = legacyCard.Content,
                    OrganizationId = legacyCard.OrganizationId,
                    Index = legacyCard.Index
                };

                legacyCard.IsLegacy = true;
                _repository.Update(legacyCard);
                await _repository.InsertAsync(newCard);
                await _repository.SaveAsync(cancellationToken);
                return ResultBuilder.Ok(response);
            }

            await query
                .UpdateFromQueryAsync(x => new PlayingCard
                {
                    Color = request.Color,
                    Content = request.Content
                }, cancellationToken);

            return ResultBuilder.Ok(response);
        }

        var defaultCardChangedContent = await _repository.Query<PlayingCard>()
            .Where(x => x.Id == request.CardId.ToString() && x.IsDefault)
            .Select(x => x.Content)
            .FirstOrDefaultAsync(cancellationToken);

        var defaultCards = DefaultPlayingCards.List();
        defaultCards.ForEach(x =>
        {
            x.IsDefault = false;
            x.OrganizationId = request.User.OrganizationId;

            if (x.Content == defaultCardChangedContent)
            {
                x.Content = request.Content;
                x.Color = request.Color;
            }
        });


        await _repository.InsertRangeAsync(defaultCards);
        await _repository.SaveAsync(cancellationToken);
        response.HasReceivedCardDeck = true;
        return ResultBuilder.Ok(response);
    }
}