using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Common;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.ClientEvents.Handlers;

[ClientEventType(nameof(ClientEventType.CardDeselected))]
public class CardDeselectedEventHandler : IClientEventHandler<CardDeselectedEvent>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public CardDeselectedEventHandler(IClientEventSender clientEventSender, IRepository repository)
    {
        _clientEventSender = clientEventSender;
        _repository = repository;
    }

    public async Task Handle(CardDeselectedEvent payload)
    {
        var isGameEnded = await _repository.Query<GameRound>()
            .Where(x => x.Id == payload.RoundId)
            .Select(x => x.Game.Status == GameStatus.Ended)
            .SingleAsync();

        if (isGameEnded)
        {
            return;
        }

        await _repository.Query<PlayedCard>().Where(x => x.RoundId == payload.RoundId && x.PlayerId == payload.PlayerId)
            .DeleteFromQueryAsync();

        await _clientEventSender.SendToAllInRound(payload, payload.RoundId);
    }
}