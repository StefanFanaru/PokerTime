using System.Threading.Tasks;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Common;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.ClientEvents.Handlers;

[ClientEventType(nameof(ClientEventType.WorkItemSelected))]
public class WorkItemSelectedEventHandler : IClientEventHandler<WorkItemSelectedEvent>
{
    private readonly IClientEventSender _clientEventSender;
    private readonly IRepository _repository;

    public WorkItemSelectedEventHandler(IClientEventSender clientEventSender, IRepository repository)
    {
        _clientEventSender = clientEventSender;
        _repository = repository;
    }

    public async Task Handle(WorkItemSelectedEvent payload)
    {
        var affected = await _repository.Query<Game>()
            .Where(x => x.Id == payload.GameId)
            .Where(x => x.Status != GameStatus.Ended)
            .UpdateFromQueryAsync(x => new Game
            {
                ActiveWorkItemId = payload.WorkItemId
            });

        if (affected > 0)
        {
            await _clientEventSender.SendToAllInGame(payload, payload.GameId);
        }
    }
}