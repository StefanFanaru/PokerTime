using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using PokerTime.Core.Abstractions;
using Serilog;

namespace PokerTime.API.SignalR
{
    public class SignalRConnectionManager : ISignalRConnectionManager
    {
        private static readonly ConcurrentDictionary<string, Dictionary<string, HashSet<string>>> ConnectionMap = new();

        public string GetUserId(string connectionId)
        {
            foreach (var (gameId, users) in ConnectionMap)
            {
                var userId = users.FirstOrDefault(x => x.Value.Contains(connectionId)).Key;
                if (userId != null)
                {
                    return userId;
                }
            }

            throw new KeyNotFoundException($"ConnectionId {connectionId} not found");
        }

        public void AddConnection(string userId, string gameId, string connectionId)
        {
            var connections = GetUserConnections(userId, gameId);

            lock (connections)
            {
                connections.Add(connectionId);
            }

            Log.Debug($"User {userId} has established a connection with the client. Total connections: {connections.Count}");
        }

        public void RemoveConnection(string connectionId)
        {
            var gameConnections = ConnectionMap.FirstOrDefault(x => x.Value.Values.Any(c => c.Contains(connectionId)));

            if (gameConnections.Value == null)
            {
                return;
            }

            var userConnections = gameConnections.Value.FirstOrDefault(x => x.Value.Contains(connectionId));

            lock (userConnections.Value)
            {
                userConnections.Value.Remove(connectionId);
            }

            if (userConnections.Value.Count == 0)
            {
                gameConnections.Value.Remove(userConnections.Key);
            }

            if (gameConnections.Value.Count == 0)
            {
                ConnectionMap.TryRemove(gameConnections);
            }

            Log.Debug($"Removed connection {connectionId}");
        }

        public Dictionary<string, IEnumerable<string>> GetAllConnectionsOfCoPlayers(string connectionId)
        {
            return ConnectionMap.Where(x => x.Value.Values.Any(c => c.Contains(connectionId)))
                .ToDictionary(x => x.Key, x =>
                    x.Value.Values.SelectMany(c => c).Where(c => c != connectionId));
        }

        public HashSet<string> GetUserConnections(string userId, string gameId)
        {
            var gameConnections = ConnectionMap.GetOrAdd(gameId, s => new Dictionary<string, HashSet<string>>());

            if (gameConnections.TryGetValue(userId, out var connections))
            {
                return connections;
            }

            gameConnections[userId] = new HashSet<string>();
            return gameConnections[userId];
        }

        public bool IsUserConnected(string userId)
        {
            return ConnectionMap.Any(x => x.Value.ContainsKey(userId));
        }

        public bool IsUserConnectedToGame(string userId, string gameId)
        {
            if (ConnectionMap.TryGetValue(gameId, out var gameConnections))
            {
                return gameConnections.ContainsKey(userId);
            }

            return false;
        }

        public IEnumerable<string> GetAllConnections()
        {
            return ConnectionMap.SelectMany(x => x.Value).SelectMany(x => x.Value);
        }

        public IEnumerable<string> GetUsersConnections(List<string> usersIds)
        {
            return ConnectionMap.Where(x => x.Value.Any(y => usersIds.Contains(y.Key)))
                .SelectMany(x => x.Value)
                .SelectMany(x => x.Value);
        }
    }
}