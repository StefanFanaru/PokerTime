using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using PokerTime.Infrastructure.Common.UserInfo;

namespace PokerTime.API.Asp.Auth
{
    public class AllowedInProjectAuthorizationHandler : AuthorizationHandler<AllowedInProjectRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserInfo _userInfo;

        public AllowedInProjectAuthorizationHandler(
            IHttpContextAccessor httpContextAccessor, IUserInfo userInfo)
        {
            _httpContextAccessor = httpContextAccessor;
            _userInfo = userInfo;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
            AllowedInProjectRequirement requirement)
        {
            var request = _httpContextAccessor?.HttpContext?.Request;
            if (request == null)
            {
                return;
            }

            var projectIdParam = request.Query["projectId"];
            if (!string.IsNullOrEmpty(projectIdParam) && _userInfo.IsAllowedInProject(projectIdParam))
            {
                context.Succeed(requirement);
                return;
            }

            if (!request.HasJsonContentType())
            {
                return;
            }

            var requestBody = await request.ReadBodyAsync<ProjectRequest>();
            if (!string.IsNullOrEmpty(requestBody.ProjectId) && _userInfo.IsAllowedInProject(requestBody.ProjectId))
            {
                context.Succeed(requirement);
            }
        }

        private class ProjectRequest
        {
            public string ProjectId { get; set; }
        }
    }
}