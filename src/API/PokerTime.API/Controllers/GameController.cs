using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerTime.Infrastructure.Commands.GameCommands.GameDelete;
using PokerTime.Infrastructure.Commands.GameCommands.GameEnd;
using PokerTime.Infrastructure.Commands.GameCommands.GameInsert;
using PokerTime.Infrastructure.Commands.GameCommands.GamePauseToggle;
using PokerTime.Infrastructure.Commands.GameCommands.GameUpdate;
using PokerTime.Infrastructure.Commands.GameRounds.FlipCards;
using PokerTime.Infrastructure.Common.UserInfo;
using PokerTime.Infrastructure.CQRS;
using PokerTime.Infrastructure.Queries.GameDetails;
using PokerTime.Infrastructure.Queries.GamesList;

namespace PokerTime.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserInfo _userInfo;

    public GameController(IMediator mediator, IUserInfo userInfo)
    {
        _mediator = mediator;
        _userInfo = userInfo;
    }

    [Authorize(Policy = "AllowedInProject")]
    [HttpPost]
    public async Task<IActionResult> InsertGame(GameInsertCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [Authorize(Policy = "AllowedInProject")]
    [HttpPatch]
    public async Task<IActionResult> UpdateGame(GameUpdateCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [Authorize(Policy = "AllowedInProject")]
    [HttpGet("details")]
    public async Task<IActionResult> GameDetails([FromQuery] GameDetailsQuery query)
    {
        return this.Result(await _mediator.Send(query.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPost("end")]
    public async Task<IActionResult> GameEnd(GameEndCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPost("pause-toggle")]
    public async Task<IActionResult> GamePause(GamePauseToggleCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPost("flip-cards")]
    public async Task<IActionResult> FlipCards(FlipCardsCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(GameDeleteCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [Authorize(Policy = "AllowedInProject")]
    [HttpGet("list")]
    public async Task<IActionResult> GetGamesList([FromQuery] GamesListQuery query)
    {
        return this.Result(await _mediator.Send(query.WithUser(_userInfo), HttpContext.RequestAborted));
    }
}