using System.Threading.Tasks;

namespace PokerTime.Core.Abstractions
{
    public interface IClientEventHandler<T>
    {
        Task Handle(string playerId, T payload);
    }
}