using Newtonsoft.Json;

namespace PokerTime.Infrastructure.Services.UserConnect.Dtos;

public class ConnectionDataResponse
{
    public AuthenticatedUser AuthenticatedUser { get; set; }
    public AuthorizedUser AuthorizedUser { get; set; }
    public string InstanceId { get; set; }
    public string DeploymentId { get; set; }
    public string DeploymentType { get; set; }
    public LocationServiceData LocationServiceData { get; set; }
}

public class Account
{
    [JsonProperty("$type")] public string Type { get; set; }

    [JsonProperty("$value")] public string Value { get; set; }
}

public class AuthenticatedUser
{
    public string Id { get; set; }
    public string Descriptor { get; set; }
    public string SubjectDescriptor { get; set; }
    public string ProviderDisplayName { get; set; }
    public bool IsActive { get; set; }
    public Properties Properties { get; set; }
    public int ResourceVersion { get; set; }
    public int MetaTypeId { get; set; }
}

public class AuthorizedUser
{
    public string Id { get; set; }
    public string Descriptor { get; set; }
    public string SubjectDescriptor { get; set; }
    public string ProviderDisplayName { get; set; }
    public bool IsActive { get; set; }
    public Properties Properties { get; set; }
    public int ResourceVersion { get; set; }
    public int MetaTypeId { get; set; }
}

public class LocationServiceData
{
    public string ServiceOwner { get; set; }
    public string DefaultAccessMappingMoniker { get; set; }
    public int LastChangeId { get; set; }
    public int LastChangeId64 { get; set; }
}

public class Properties
{
    public Account Account { get; set; }
}