using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Common;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.ClientEvents.Handlers;

[ClientEventType(nameof(ClientEventType.ShouldRefreshGame))]
public class ShouldRefreshGameEventHandler : IClientEventHandler<ShouldRefreshGameEvent>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public ShouldRefreshGameEventHandler(IClientEventSender clientEventSender, IRepository repository)
    {
        _clientEventSender = clientEventSender;
        _repository = repository;
    }

    public async Task Handle(string playerId, ShouldRefreshGameEvent payload)
    {
        var gameFound = await _repository.Query<Game>()
            .Where(x => x.Id == payload.GameId)
            .Select(x => x.Status == GameStatus.Ended && x.OwnerId == playerId)
            .AnyAsync();

        if (!gameFound)
        {
            return;
        }

        await _clientEventSender.SendToAllInGame(payload, payload.GameId);
    }
}