using System;

namespace PokerTime.Core.Entities
{
    public abstract class Entity<T>
    {
        protected Entity(T id)
        {
            if (Equals(id, default(T)))
            {
                throw new ArgumentException("The ID cannot be the type's default value.", nameof(id));
            }

            Id = id;
        }

        protected Entity()
        {
        }

        public T Id { get; set; }
    }
}