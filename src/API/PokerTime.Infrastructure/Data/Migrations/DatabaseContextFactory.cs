using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PokerTime.Infrastructure.Data.Migrations
{
    public class PokerTimeContextFactory : IDesignTimeDbContextFactory<PokerTimeContext>
    {
        private const string ConnectionString =
            "Server=.\\SQLExpress;Database=stefanaru-db;Trusted_Connection=True;MultipleActiveResultSets=true";

        public PokerTimeContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<PokerTimeContext>();
            optionsBuilder.UseSqlServer(ConnectionString,
                sql => sql.MigrationsHistoryTable("__EFMigrationsHistory", "poker-time"));

            return new PokerTimeContext(optionsBuilder.Options);
        }
    }
}