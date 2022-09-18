using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace PokerTime.Infrastructure.Data.Repositories
{
    public abstract class EfRepository<TContext> : IRepository
        where TContext : DbContext
    {
        private readonly TContext _context;

        protected EfRepository(TContext context)
        {
            _context = context;
        }

        /// <summary>
        ///     Gets the query on the database entities.
        /// </summary>
        /// <returns>The query.</returns>
        public virtual IQueryable<TEntity> Query<TEntity>() where TEntity : class
        {
            return _context.Set<TEntity>();
        }

        public virtual ValueTask<object> QueryDynamic(Type entityType, object primaryKey)
        {
            return _context.FindAsync(entityType, primaryKey);
        }

        /// <summary>
        ///     Gets the entity by identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <returns></returns>
        public async Task<TEntity> GetByIdAsync<TEntity>(object id) where TEntity : class
        {
            var entity = await _context.Set<TEntity>().FindAsync(id);

            if (entity == null) throw new ArgumentException($"The entity of type {typeof(TEntity)} with id {id} was not found.");

            return entity;
        }

        /// <summary>
        ///     Inserts the specified entity.
        /// </summary>
        /// <param name="entity">The entity.</param>
        public virtual void Insert<TEntity>(TEntity entity) where TEntity : class
        {
            _context.Set<TEntity>().Add(entity);
        }

        /// <summary>
        ///     Inserts the specified entity.
        /// </summary>
        /// <param name="entity">The entity.</param>
        public virtual async Task InsertAsync<TEntity>(TEntity entity) where TEntity : class
        {
            await _context.Set<TEntity>().AddAsync(entity);
        }

        /// <summary>
        ///     Inserts multiple entities at once.
        /// </summary>
        /// <param name="entities">The entities.</param>
        public virtual async Task InsertRangeAsync<TEntity>(IEnumerable<TEntity> entities) where TEntity : class
        {
            await _context.Set<TEntity>().AddRangeAsync(entities);
        }

        /// <summary>
        ///     Deletes the specified identifier.
        /// </summary>
        /// <param name="id">The identifier.</param>
        public virtual void Delete<TEntity>(object id) where TEntity : class
        {
            var entityToDelete = _context.Set<TEntity>().Find(id);
            Delete(entityToDelete);
        }

        /// <summary>
        ///     Deletes the specified entity.
        /// </summary>
        /// <param name="entity">The entity.</param>
        public virtual void Delete<TEntity>(TEntity entity) where TEntity : class
        {
            if (_context.Entry(entity).State == EntityState.Detached) _context.Set<TEntity>().Attach(entity);

            _context.Set<TEntity>().Remove(entity);
        }

        /// <summary>
        ///     Updates the specified entity.
        /// </summary>
        /// <param name="entity">The entity.</param>
        public virtual bool Update<TEntity>(TEntity entity) where TEntity : class
        {
            _context.Update(entity);
            return true;
        }

        public void Save()
        {
            _context.SaveChanges();
        }

        public async Task<int> SaveAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task ExecuteTransactionalAsync(Func<IDbContextTransaction, Task> action)
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (action != null)
                {
                    await action(transaction);
                }

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task ExecuteTransactionalAsync(Func<Task> action)
        {
            await ExecuteTransactionalAsync(async _ => { await action(); });
        }

        public void ClearChangeTracker()
        {
            _context.ChangeTracker.Clear();
        }
    }
}