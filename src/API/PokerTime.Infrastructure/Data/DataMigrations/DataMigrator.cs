using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;

namespace PokerTime.Infrastructure.Data.DataMigrations
{
    [ExcludeFromCodeCoverage]
    public class DataMigrator : IDataMigrator
    {
        private readonly PokerTimeContext _context;
        private readonly IEnumerable<IDataMigration> _dataMigrations;

        public DataMigrator(PokerTimeContext context, IEnumerable<IDataMigration> dataMigrations)
        {
            _context = context;
            _dataMigrations = dataMigrations;
        }

        public void MigrateData()
        {
            _context.Database.Migrate();

            var appMigrations = _context.DataMigrations.Select(m => m.Name).ToList();

            foreach (var migration in _dataMigrations.Where(m => !appMigrations.Contains(m.GetType().Name)))
            {
                migration.Migrate();
                InsertDatabaseMigration(migration.GetType().Name, nameof(PokerTimeContext));
                _context.SaveChanges();
            }
        }

        private void InsertDatabaseMigration(string name, string type)
        {
            var dataMigration = new DataMigration(name, type);
            _context.DataMigrations.Add(dataMigration);
        }
    }
}