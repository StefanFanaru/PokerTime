using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Common;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.ClientEvents.Handlers;

[ClientEventType(nameof(ClientEventType.CardSelected))]
public class CardSelectedEventHandler : IClientEventHandler<CardSelectedEvent>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public CardSelectedEventHandler(IClientEventSender clientEventSender, IRepository repository)
    {
        _clientEventSender = clientEventSender;
        _repository = repository;
    }

    public async Task Handle(string playerId, CardSelectedEvent payload)
    {
        var isGameActive = await _repository.Query<GameRound>()
            .Where(x => x.Id == payload.RoundId && x.Game.Status == GameStatus.Active)
            .Where(x => x.Players.Any(p => p.PlayerId == playerId))
            .AnyAsync();

        if (!isGameActive)
        {
            return;
        }

        var cardsWereFlipped = false;

        await _repository.ExecuteTransactionalAsync(async _ =>
        {
            await _repository.Query<PlayedCard>()
                .Where(x => x.RoundId == payload.RoundId && x.PlayerId == playerId)
                .DeleteFromQueryAsync();

            _repository.Insert(new PlayedCard(payload.PlayingCardId, playerId, payload.RoundId));
            await _repository.SaveAsync();

            cardsWereFlipped = await _repository.Query<GameRound>().Where(x => x.Id == payload.RoundId)
                .Select(x => x.CardsWereFlipped).SingleAsync();

            var playedCard = await _repository.Query<PlayingCard>().Where(x => x.Id == payload.PlayingCardId).SingleAsync();
            payload.PlayingCardId = playedCard.Id;
            payload.Content = playedCard.Content;
            payload.Color = playedCard.Color;
        });

        payload.PlayerId = playerId;
        await _clientEventSender.SendToAllInRound(cardsWereFlipped
            ? payload
            : new CardSelectedEvent
            {
                RoundId = payload.RoundId,
                PlayerId = playerId,
                GameId = payload.GameId
            }, payload.RoundId);

        await _clientEventSender.SendToUserAsync(payload, playerId, payload.GameId);
    }
}