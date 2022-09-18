using PokerTime.Infrastructure.Common.UserInfo;
using PokerTime.Infrastructure.CQRS.Operations;

namespace PokerTime.Infrastructure.CQRS
{
    public class UserBasedQuery<T> : IRequest<IOperationResult<T>>, IIncludesUserId
    {
        public IUserInfo User { get; set; }
    }

    public class UserBasedIdQuery<T> : UserBasedQuery<T>, IIncludesId
    {
        public string Id { get; set; }
    }

    public class UserBasedCommand<T> : IRequest<IOperationResult<T>>, IIncludesUserId
    {
        public IUserInfo User { get; set; }
    }

    public class UserBasedIdCommand<T> : UserBasedCommand<T>, IIncludesId
    {
        public string Id { get; set; }
    }

    public interface IIncludesUserId
    {
        public IUserInfo User { get; set; }
    }

    public interface IIncludesId
    {
        public string Id { get; set; }
    }

    public static class UserBasedHelpers
    {
        public static T WithUser<T>(this T query, IUserInfo user) where T : IIncludesUserId
        {
            query.User = user;
            return query;
        }

        public static T WithId<T>(this T query, string id) where T : IIncludesId
        {
            query.Id = id;
            return query;
        }
    }
}