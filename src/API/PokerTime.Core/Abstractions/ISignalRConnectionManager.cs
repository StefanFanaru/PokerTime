using System.Collections.Generic;

namespace PokerTime.Core.Abstractions
{
    public interface ISignalRConnectionManager
    {
        string GetUserId(string connectionId);
        string GetGameId(string connectionId);
        void AddConnection(string userId, string gameId, string connectionId);
        void RemoveConnection(string connectionId);
        Dictionary<string, IEnumerable<string>> GetAllConnectionsOfCoPlayers(string connectionId);
        HashSet<string> GetUserConnections(string userId, string gameId);
        bool IsUserConnected(string userId);
        bool IsUserConnectedToGame(string userId, string gameId);
        IEnumerable<string> GetAllConnections();
        IEnumerable<string> GetUsersConnections(List<string> usersIds);
    }
}