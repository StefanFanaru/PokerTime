using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using PokerTime.Infrastructure.CQRS.Errors;
using PokerTime.Infrastructure.CQRS.Operations;

namespace PokerTime.Infrastructure.CQRS
{
    public class ValidationBehaviour<TRequest, TOperationResult> : IPipelineBehavior<TRequest, IOperationResult<TOperationResult>>
        where TRequest : IRequest<IOperationResult<TOperationResult>>
    {
        private readonly IValidator<TRequest> _validator;

        public ValidationBehaviour(IValidator<TRequest> validator)
        {
            _validator = validator;
        }

        public async Task<IOperationResult<TOperationResult>> Handle(TRequest request, CancellationToken cancellationToken,
            RequestHandlerDelegate<IOperationResult<TOperationResult>> next)
        {
            var validationResult = await _validator.ValidateAsync(request, cancellationToken).ConfigureAwait(false);
            if (validationResult.IsValid)
            {
                return await next().ConfigureAwait(false);
            }

            var resultBuilder = ResultBuilder
                .Error<TOperationResult>(HttpStatusCode.BadRequest, "One or more validation errors have occured")
                .ForTarget(nameof(request));

            foreach (var validationResultError in validationResult.Errors)
            {
                resultBuilder.WithDetailsError(() =>
                    new ErrorBuilder(HttpStatusCode.BadRequest, validationResultError.ErrorMessage).ForTarget(
                        validationResultError.PropertyName));
            }

            return resultBuilder.Build();
        }
    }
}