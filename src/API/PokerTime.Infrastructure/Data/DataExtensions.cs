using System;
using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Data.DataMigrations;

namespace PokerTime.Infrastructure.Data
{
    [ExcludeFromCodeCoverage]
    public static class DataExtensions
    {
        public static IServiceCollection AddAppDatabase<TContext>(this IServiceCollection services, string connectionString)
            where TContext : DbContext
        {
            var migrationsAssembly = typeof(TContext).GetTypeInfo().Assembly.GetName().Name;

            services.AddDbContext<TContext>(options =>
                options.UseSqlServer(connectionString,
                    sql => sql.MigrationsAssembly(migrationsAssembly)
                        .MigrationsHistoryTable("__EFMigrationsHistory", "poker-time")));

            return services;
        }

        public static async Task InitializeDatabase<TContext>(this IServiceProvider serviceProvider,
            bool includeDataMigrations = true, int retryForAvailability = 0)
            where TContext : DbContext
        {
            var logger = serviceProvider.GetRequiredService<ILogger<DataMigration>>();
            try
            {
                if (includeDataMigrations)
                {
                    serviceProvider.GetRequiredService<IDataMigrator>().MigrateData();
                    includeDataMigrations = false;
                }
            }
            catch (Exception e)
            {
                if (retryForAvailability > 5)
                {
                    throw;
                }

                retryForAvailability++;
                await Task.Delay(2000 * retryForAvailability);
                logger.LogError(e.Message);
                logger.LogInformation($"Retrying database initialization. Retry number {retryForAvailability}");
                await serviceProvider.InitializeDatabase<TContext>(includeDataMigrations, retryForAvailability);
            }
        }
    }
}