using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Common;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardInsert;

public class PlayingCardInsertCommandHandler : IRequestHandler<PlayingCardInsertCommand, IOperationResult<
    PlayingCardInsertCommandResponse>>
{
    private readonly IRepository _repository;

    public PlayingCardInsertCommandHandler(IRepository repository)
    {
        _repository = repository;
    }

    public async Task<IOperationResult<PlayingCardInsertCommandResponse>> Handle(PlayingCardInsertCommand request,
        CancellationToken cancellationToken)
    {
        var response = new PlayingCardInsertCommandResponse();
        var existing = await _repository.Query<PlayingCard>()
            .Where(x => x.OrganizationId == request.User.OrganizationId)
            .Where(x => x.Content == request.Content && !x.IsDeleted)
            .Select(x => new { x.Id, x.IsDefault })
            .FirstOrDefaultAsync(cancellationToken);

        if (existing != null)
        {
            return ResultBuilder.Ok(response);
        }

        await _repository.ExecuteTransactionalAsync(async () =>
        {
            var hasCards = await _repository.Query<PlayingCard>()
                .Where(x => x.OrganizationId == request.User.OrganizationId)
                .AnyAsync(cancellationToken);

            var entity = new PlayingCard
            {
                Id = Guid.NewGuid().ToString(),
                Color = request.Color,
                OrganizationId = request.User.OrganizationId,
                Content = request.Content
            };

            response.CardId = entity.Id;

            if (hasCards)
            {
                var lastIndex = await _repository.Query<PlayingCard>()
                    .Where(x => x.OrganizationId == request.User.OrganizationId)
                    .Select(x => x.Index)
                    .MaxAsync(cancellationToken);

                entity.Index = lastIndex + 1;
                await _repository.InsertAsync(entity);
                await _repository.SaveAsync(cancellationToken);
            }
            else
            {
                var defaultCards = DefaultPlayingCards.List();
                defaultCards.ForEach(x =>
                {
                    x.IsDefault = false;
                    x.OrganizationId = request.User.OrganizationId;
                });

                entity.Index = defaultCards.Count + 1;
                defaultCards.Add(entity);

                await _repository.InsertRangeAsync(defaultCards);
                await _repository.SaveAsync(cancellationToken);
                response.HasReceivedCardDeck = true;
            }
        });

        return ResultBuilder.Ok(response);
    }
}