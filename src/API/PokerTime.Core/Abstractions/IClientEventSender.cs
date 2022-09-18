using System.Threading.Tasks;

namespace PokerTime.Core.Abstractions
{
    public interface IClientEventSender
    {
        Task SendToUserAsync(IClientEvent clientEvent, string userId, string gameId);
        Task SendToAll(IClientEvent clientEvent);
        Task SendToAllCoPlayers(IClientEvent clientEvent, string connectionId);
        Task SendToAllInRound(IClientEvent clientEvent, string roundId);
        Task SendToAllInGame(IClientEvent clientEvent, string gameId);
    }
}