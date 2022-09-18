using System.Security.Claims;

namespace PokerTime.Infrastructure.Common.UserInfo
{
    public class UserInfo : IUserInfo
    {
        protected UserInfo(ClaimsPrincipal user)
        {
            if (user == null)
            {
                return;
            }

            Id = user.Claims.FirstOrDefault(x => x.Type == Claims.UserId)?.Value;
            Email = user.Claims.FirstOrDefault(x => x.Type == Claims.Email)?.Value;
            AllowedProjectsIds = user.Claims.FirstOrDefault(x => x.Type == Claims.Projects)?.Value.Split(',');
            Name = user.Claims.FirstOrDefault(x => x.Type == Claims.Name)?.Value;
            OrganizationId = user.Claims.FirstOrDefault(x => x.Type == Claims.OrganizationId)?.Value;
            OrganizationName = user.Claims.FirstOrDefault(x => x.Type == Claims.OrganizationName)?.Value;
        }

        private string[] AllowedProjectsIds { get; }

        public string Id { get; }
        public string Email { get; }
        public string Name { get; }
        public string OrganizationId { get; }
        public string OrganizationName { get; }

        public bool IsAllowedInProject(string projectId)
        {
            return AllowedProjectsIds?.Contains(projectId) ?? false;
        }
    }
}