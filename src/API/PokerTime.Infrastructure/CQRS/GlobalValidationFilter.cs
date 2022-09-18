using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PokerTime.Infrastructure.CQRS.Errors;
using PokerTime.Infrastructure.CQRS.Operations;

namespace PokerTime.Infrastructure.CQRS
{
    public class GlobalValidationFilter : IActionFilter
    {
        public void OnActionExecuted(ActionExecutedContext context)
        {
            // Not needed
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var modelState = context.ModelState;

            if (!modelState.IsValid)
            {
                var builder = ResultBuilder.Error<object>(HttpStatusCode.BadRequest, "Invalid parameters provided in request")
                    .ForTarget("request");

                foreach (var error in modelState.Keys.SelectMany(key =>
                             modelState[key].Errors.Select(x => new
                             {
                                 Key = key,
                                 ErrorMessage = string.IsNullOrEmpty(x.ErrorMessage) ? x.Exception?.Message : x.ErrorMessage
                             })))
                {
                    builder.WithDetailsError(() =>
                        new ErrorBuilder(HttpStatusCode.BadRequest, error.ErrorMessage).ForTarget(error.Key));
                }

                context.Result = new ObjectResult(builder.Build());
            }
        }
    }
}