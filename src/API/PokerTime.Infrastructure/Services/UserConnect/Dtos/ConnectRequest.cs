using System.ComponentModel.DataAnnotations;

namespace PokerTime.Infrastructure.Services.UserConnect.Dtos;

public class ConnectRequest
{
    [Required] public string AccessToken { get; set; }

    [Required] [MaxLength(100)] public string OrganizationName { get; set; }
}