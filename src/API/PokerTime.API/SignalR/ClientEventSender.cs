using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Entities;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.ClientEvents;
using PokerTime.Infrastructure.Data.Repositories;
using PokerTime.Infrastructure.Helpers;
using Serilog;

namespace PokerTime.API.SignalR
{
    public class ClientEventSender : IClientEventSender
    {
        private readonly IHubContext<ClientEventHub> _hubContext;
        private readonly IRepository _repository;
        private readonly ISignalRConnectionManager _signalRConnection;

        public ClientEventSender(IHubContext<ClientEventHub> hubContext, ISignalRConnectionManager signalRConnection,
            IRepository repository)
        {
            _hubContext = hubContext;
            _signalRConnection = signalRConnection;
            _repository = repository;
        }

        public async Task SendToUserAsync(IClientEvent clientEvent, string userId, string gameId)
        {
            var connections = _signalRConnection.GetUserConnections(userId, gameId);
            await SendToConnectionsAsync(clientEvent, connections, gameId);
        }

        public async Task SendToAll(IClientEvent clientEvent)
        {
            var connections = _signalRConnection.GetAllConnections();
            await SendToConnectionsAsync(clientEvent, connections, null);
        }

        public async Task SendToAllCoPlayers(IClientEvent clientEvent, string connectionId)
        {
            var connections = _signalRConnection.GetAllConnectionsOfCoPlayers(connectionId);
            var tasks = connections.Select(c => SendToConnectionsAsync(clientEvent, c.Value, c.Key));
            await Task.WhenAll(tasks);
        }

        public async Task SendToAllInRoundExceptCurrentPlayer(IClientEvent clientEvent, string roundId, string playerId)
        {
            var roundData = await _repository.Query<GameRoundPlayer>()
                .Where(r => r.RoundId == roundId)
                .Where(x => x.PlayerId != playerId)
                .Select(x => new
                {
                    x.Round.GameId, x.PlayerId
                })
                .ToListAsync();

            if (!roundData.Any())
            {
                return;
            }

            var playerIds = roundData.Select(x => x.PlayerId).ToList();
            await SendToPlayersAsync(clientEvent, playerIds, roundData.First().GameId);
        }

        public async Task SendToAllInRound(IClientEvent clientEvent, string roundId)

        {
            var roundData = await _repository.Query<GameRoundPlayer>()
                .Where(r => r.RoundId == roundId)
                .Select(x => new
                {
                    x.Round.GameId, x.PlayerId
                })
                .ToListAsync();

            var playerIds = roundData.Select(x => x.PlayerId).ToList();
            await SendToPlayersAsync(clientEvent, playerIds, roundData.First().GameId);
        }

        public async Task SendToAllInGame(IClientEvent clientEvent, string gameId)
        {
            var usersInRound = await _repository.Query<Game>()
                .Where(r => r.Id == gameId)
                .Where(r => r.Status != GameStatus.Ended)
                .SelectMany(r => r.Rounds)
                .SelectMany(r => r.Players)
                .Select(x => x.PlayerId)
                .Distinct()
                .ToListAsync();

            var connections = _signalRConnection.GetUsersConnections(usersInRound);
            await SendToConnectionsAsync(clientEvent, connections, gameId);
        }

        private async Task SendToPlayersAsync(IClientEvent clientEvent, List<string> playerIds, string gameId)
        {
            var connections = _signalRConnection.GetUsersConnections(playerIds);
            await SendToConnectionsAsync(clientEvent, connections, gameId);
        }

        private async Task SendToConnectionsAsync(IClientEvent clientEvent, IEnumerable<string> connections, string gameId)
        {
            if (connections == null)
            {
                Log.Debug("No connections were found");
                return;
            }

            var appEvent = new ClientEvent(clientEvent);
            appEvent.GameId = gameId;

            var tasksChunks = connections.Select(async connection =>
            {
                try
                {
                    await _hubContext.Clients.Clients(connection).SendAsync("client-events", appEvent.ToJson());
                    Log.Debug($"Sending ClientEvent to connection {connection}");
                }
                catch (Exception e)
                {
                    Log.Error(e.Message);
                }
            }).Chunk(50);

            foreach (var tasks in tasksChunks)
            {
                await Task.WhenAll(tasks);
            }
        }
    }
}