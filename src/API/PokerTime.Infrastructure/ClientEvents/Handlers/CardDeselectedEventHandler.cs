﻿using System.Threading.Tasks;
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

    public async Task Handle(string playerId, CardDeselectedEvent payload)
    {
        var isGameActive = await _repository.Query<GameRound>()
            .Where(x => x.Id == payload.RoundId && x.Game.Status == GameStatus.Active)
            .Where(x => x.Players.Any(p => p.PlayerId == playerId))
            .AnyAsync();

        if (!isGameActive)
        {
            return;
        }

        payload.PlayerId = playerId;
        await _repository.Query<PlayedCard>().Where(x => x.RoundId == payload.RoundId && x.PlayerId == playerId)
            .DeleteFromQueryAsync();

        await _clientEventSender.SendToAllInRoundExceptCurrentPlayer(payload, payload.RoundId, playerId);
    }
}