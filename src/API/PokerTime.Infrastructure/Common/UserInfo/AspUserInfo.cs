using Microsoft.AspNetCore.Http;

namespace PokerTime.Infrastructure.Common.UserInfo
{
    public class AspUserInfo : UserInfo
    {
        public AspUserInfo(IHttpContextAccessor httpContextAccessor)
            : base(httpContextAccessor.HttpContext?.User)
        {
        }
    }
}