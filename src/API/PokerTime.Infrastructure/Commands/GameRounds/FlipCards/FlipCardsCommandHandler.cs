using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.GameRounds.FlipCards;

public class FlipCardsHandler : IRequestHandler<FlipCardsCommand, IOperationResult<List<PlayedCardDto>>>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public FlipCardsHandler(IRepository repository, IClientEventSender clientEventSender)
    {
        _repository = repository;
        _clientEventSender = clientEventSender;
    }

    public async Task<IOperationResult<List<PlayedCardDto>>> Handle(FlipCardsCommand request,
        CancellationToken cancellationToken)
    {
        var query = _repository.Query<GameRound>()
            .Where(x => x.GameId == request.GameId)
            .Where(x => x.Game.OwnerId == request.User.Id)
            .Where(x => x.Id == request.RoundId);

        var affected = await query
            .UpdateFromQueryAsync(x => new GameRound
            {
                CardsWereFlipped = true
            }, cancellationToken);


        var cards = await _repository.Query<PlayedCard>()
            .Where(x => x.RoundId == request.RoundId)
            .Select(x => new PlayedCardDto
            {
                PlayerId = x.PlayerId,
                Content = x.PlayingCard.Content,
                Color = x.PlayingCard.Color,
                CardId = x.PlayingCardId
            })
            .ToListAsync(cancellationToken);

        if (affected == 1)
        {
            await _clientEventSender.SendToAllInGame(new CardsWereFlippedEvent
            {
                Cards = cards
            }, request.GameId);
        }

        return affected == 0 ? ResultBuilder.NotFound<List<PlayedCardDto>>() : ResultBuilder.Ok(cards);
    }
}