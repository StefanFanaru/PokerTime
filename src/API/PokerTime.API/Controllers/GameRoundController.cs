using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerTime.Infrastructure.Commands.GameRounds.FlipCards;
using PokerTime.Infrastructure.Commands.GameRounds.GameRoundInsert;
using PokerTime.Infrastructure.Commands.GameRounds.GameRoundSetStoryPoints;
using PokerTime.Infrastructure.Common.UserInfo;
using PokerTime.Infrastructure.CQRS;
using PokerTime.Infrastructure.Queries.GameRounds.PlayedCardQuery;
using PokerTime.Infrastructure.Queries.GameRounds.PlayedCardsQuery;

namespace PokerTime.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class GameRoundController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserInfo _userInfo;

    public GameRoundController(IMediator mediator, IUserInfo userInfo)
    {
        _mediator = mediator;
        _userInfo = userInfo;
    }

    [HttpPost("insert")]
    public async Task<IActionResult> Insert(GameRoundInsertCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPatch("set-story-points")]
    public async Task<IActionResult> SetStoryPoint(GameRoundSetStoryPointsCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPatch("{id}/flip-cards")]
    public async Task<IActionResult> FlipCards(string id)
    {
        return this.Result(await _mediator.Send(new FlipCardsCommand(id).WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpGet("{id}/played-cards")]
    public async Task<IActionResult> GetPlayedCards(string id)
    {
        return this.Result(await _mediator.Send(new PlayedCardsQuery(id).WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpGet("{id}/played-card")]
    public async Task<IActionResult> GetPlayedCard(string id)
    {
        return this.Result(await _mediator.Send(new PlayedCardQuery(id).WithUser(_userInfo), HttpContext.RequestAborted));
    }
}