using System.Threading.Tasks;

namespace PokerTime.Core.Abstractions
{
    public interface IClientEventHandler<T>
    {
        Task Handle(T payload);
    }
}