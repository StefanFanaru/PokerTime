using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerTime.API.Common;
using PokerTime.Infrastructure.Services.UserConnect;
using PokerTime.Infrastructure.Services.UserConnect.Dtos;

namespace PokerTime.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConnectController : ControllerBase
{
    private readonly UserConnectService _userConnect;

    public ConnectController(UserConnectService userConnect)
    {
        _userConnect = userConnect;
    }

    [Authorize(AuthenticationSchemes = AuthenticationSchemeNames.ExtensionToken)]
    [HttpGet("token")]
    public Task<IActionResult> GetToken([FromQuery] ConnectRequest request)
    {
        return _userConnect.ConnectAsync(request, HttpContext.RequestAborted);
    }
}