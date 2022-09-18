using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;

namespace PokerTime.Infrastructure.Data.Repositories
{
    public interface IEfRepository
    {
        /// <summary>
        ///     Gets the query on the database entities.
        /// </summary>
        /// <returns>The query.</returns>
        IQueryable<TEntity> Query<TEntity>() where TEntity : class;

        /// <summary>
        ///     Query a dynamic entity by specifying it's type and primary key
        /// </summary>
        /// <returns></returns>
        ValueTask<object> QueryDynamic(Type entityType, object primaryKey);

        /// <summary>
        ///     Gets the entity by identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <returns></returns>
        Task<TEntity> GetByIdAsync<TEntity>(object id) where TEntity : class;

        /// <summary>
        ///     Inserts the specified entity into the database.
        /// </summary>
        /// <param name="entity">The entity.</param>
        void Insert<TEntity>(TEntity entity) where TEntity : class;

        /// <summary>
        ///     Inserts the specified entity into the database.
        /// </summary>
        /// <param name="entity">The entity.</param>
        Task InsertAsync<TEntity>(TEntity entity) where TEntity : class;

        Task InsertRangeAsync<TEntity>(IEnumerable<TEntity> entities) where TEntity : class;

        /// <summary>
        ///     Deletes the entity coresponding to the specified id.
        /// </summary>
        /// <param name="id">The identifier.</param>
        void Delete<TEntity>(object id) where TEntity : class;

        /// <summary>
        ///     Deletes the specified entity.
        /// </summary>
        /// <param name="entity">The entity.</param>
        void Delete<TEntity>(TEntity entity) where TEntity : class;

        /// <summary>
        ///     Updates the specified entity.
        /// </summary>
        /// <param name="entity">The entity.</param>
        bool Update<TEntity>(TEntity entity) where TEntity : class;

        /// <summary>
        ///     Saves the modified entities to the database.
        /// </summary>
        void Save();

        /// <summary>
        ///     Saves the modified entities to the database.
        /// </summary>
        Task<int> SaveAsync(CancellationToken cancellationToken = default);

        Task ExecuteTransactionalAsync(Func<IDbContextTransaction, Task> action);
        Task ExecuteTransactionalAsync(Func<Task> action);

        void ClearChangeTracker();
    }
}