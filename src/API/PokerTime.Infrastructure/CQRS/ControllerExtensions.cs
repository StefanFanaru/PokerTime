using System.Net;
using Microsoft.AspNetCore.Mvc;
using PokerTime.Infrastructure.CQRS.Operations;

namespace PokerTime.Infrastructure.CQRS
{
    public static class ControllerExtensions
    {
        public static IActionResult Result<T>(this ControllerBase controller, IOperationResult<T> result)
        {
            if (result.StatusCode == HttpStatusCode.NoContent)
            {
                return new NoContentResult();
            }

            if (typeof(T) == typeof(Unit) &&
                (result.StatusCode == HttpStatusCode.OK || result.StatusCode == HttpStatusCode.Created))
            {
                return new OkResult();
            }


            return new OperationActionResult<T>(result);
        }
    }
}