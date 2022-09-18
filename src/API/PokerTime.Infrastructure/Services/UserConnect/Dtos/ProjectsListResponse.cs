namespace PokerTime.Infrastructure.Services.UserConnect.Dtos;

public class ProjectsListResponse
{
    public int Count { get; set; }
    public List<Value> Value { get; set; }
}

public class Value
{
    public string Id { get; set; }
}