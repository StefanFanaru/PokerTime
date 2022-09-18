namespace PokerTime.Infrastructure.Data.Repositories
{
    public class Repository : EfRepository<PokerTimeContext>
    {
        public Repository(PokerTimeContext context) : base(context)
        {
        }
    }
}