namespace PokerTime.Infrastructure.Common.UserInfo
{
    public interface IUserInfo
    {
        public string Id { get; }
        public string Email { get; }
        public string Name { get; }
        public string OrganizationId { get; }
        public string OrganizationName { get; }
        bool IsAllowedInProject(string projectId);
    }
}