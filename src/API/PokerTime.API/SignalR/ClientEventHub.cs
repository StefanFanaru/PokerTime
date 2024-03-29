﻿using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.ClientEvents;
using PokerTime.Infrastructure.ClientEvents.Events;
using PokerTime.Infrastructure.Common.UserInfo;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.API.SignalR
{
    [Authorize]
    public class ClientEventHub : Hub
    {
        private readonly IClientEventSender _clientEventSender;
        private readonly IServiceProvider _serviceProvider;
        private readonly ISignalRConnectionManager _signalRConnectionManager;
        private readonly IUserInfo _userInfo;

        public ClientEventHub(ISignalRConnectionManager signalRConnectionManager, IUserInfo userInfo,
            IServiceProvider serviceProvider)
        {
            _signalRConnectionManager = signalRConnectionManager;
            _clientEventSender = serviceProvider.GetRequiredService<IClientEventSender>();
            _userInfo = userInfo;
            _serviceProvider = serviceProvider;
        }

        public async Task<string> RegisterConnection(string gameId)
        {
            _signalRConnectionManager.AddConnection(_userInfo.Id, gameId, Context.ConnectionId);
            await _clientEventSender.SendToAllInGame(new PlayerConnectedEvent
            {
                PlayerId = _userInfo.Id
            }, gameId);
            return Context.ConnectionId;
        }

        public async Task ReceivedEvent(string message)
        {
            var receivedEvent = JsonConvert.DeserializeObject<ReceivedEvent>(message);
            var playerId = _signalRConnectionManager.GetUserId(Context.ConnectionId);
            await _serviceProvider.CallClientEventHandler(receivedEvent.Type, playerId, receivedEvent.Payload);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var connectionId = Context.ConnectionId;
            await _clientEventSender.SendToAllCoPlayers(new PlayerDisconnectedEvent
            {
                PlayerId = _userInfo.Id
            }, connectionId);

            await SendRefreshIfOwner(connectionId);

            _signalRConnectionManager.RemoveConnection(connectionId);
        }

        private async Task SendRefreshIfOwner(string connectionId)
        {
            var userId = _signalRConnectionManager.GetUserId(connectionId);
            var gameId = _signalRConnectionManager.GetGameId(connectionId);
            var repository = _serviceProvider.GetRequiredService<IRepository>();
            var isOwner = await repository.Query<Game>().AnyAsync(x => x.OwnerId == userId && x.Id == gameId);
            if (isOwner)
            {
                await _clientEventSender.SendToAllCoPlayers(new ShouldRefreshGameEvent(), connectionId);
            }
        }
    }
}