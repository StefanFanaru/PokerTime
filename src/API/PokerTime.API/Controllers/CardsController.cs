using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardDelete;
using PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardInsert;
using PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardUpdate;
using PokerTime.Infrastructure.Commands.PlayingCards.PlayingCardUpdateIndexes;
using PokerTime.Infrastructure.Common.UserInfo;
using PokerTime.Infrastructure.CQRS;
using PokerTime.Infrastructure.Queries.Cards;

namespace PokerTime.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUserInfo _userInfo;

    public CardsController(IMediator mediator, IUserInfo userInfo)
    {
        _mediator = mediator;
        _userInfo = userInfo;
    }

    [HttpGet("list")]
    public async Task<IActionResult> GameDetails()
    {
        return this.Result(await _mediator.Send(new PlayingCardsQuery().WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPatch("update")]
    public async Task<IActionResult> Update(PlayingCardUpdateCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPatch("update-indexes")]
    public async Task<IActionResult> UpdateIndexes(PlayingCardUpdateIndexesCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpDelete]
    public async Task<IActionResult> Delete(PlayingCardDeleteCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }

    [HttpPost]
    public async Task<IActionResult> Insert(PlayingCardInsertCommand command)
    {
        return this.Result(await _mediator.Send(command.WithUser(_userInfo), HttpContext.RequestAborted));
    }
}