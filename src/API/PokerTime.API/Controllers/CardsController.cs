using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokerTime.Infrastructure.CQRS;
using PokerTime.Infrastructure.Queries.Cards;

namespace PokerTime.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CardsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("list")]
    public async Task<IActionResult> GameDetails()
    {
        return this.Result(await _mediator.Send(new PlayingCardsQuery(), HttpContext.RequestAborted));
    }
}