using System;
using System.Net;
using PokerTime.Infrastructure.CQRS.Errors;

namespace PokerTime.Infrastructure.CQRS.Operations
{
    public class ErrorResultBuilder<T>
    {
        private readonly ErrorBuilder _errorBuilder;

        public ErrorResultBuilder(HttpStatusCode statusCode, string message)
        {
            _errorBuilder = new ErrorBuilder(statusCode, message);
        }

        public IOperationResult<T> Build()
        {
            return new OperationResult<T>(_errorBuilder.Build());
        }

        public ErrorResultBuilder<T> ForTarget(string targetString)
        {
            _errorBuilder.ForTarget(targetString);
            return this;
        }

        public ErrorResultBuilder<T> WithDetailsError(Func<ErrorBuilder> detailsErrorBuilder)
        {
            _errorBuilder.WithErrorDetails(detailsErrorBuilder);
            return this;
        }

        public ErrorResultBuilder<T> WithInner(Func<InnerErrorBuilder> builderAction)
        {
            _errorBuilder.WithInner(builderAction);
            return this;
        }
    }

    public static class ResultBuilder
    {
        public static ErrorResultBuilder<T> Error<T>(HttpStatusCode statusCode, string message)
        {
            return new ErrorResultBuilder<T>(statusCode, message);
        }

        public static IOperationResult<T> Ok<T>(T result)
        {
            return new OperationResult<T>(result, HttpStatusCode.OK);
        }

        public static IOperationResult<Unit> Ok()
        {
            return new OperationResult<Unit>(HttpStatusCode.OK);
        }

        public static IOperationResult<Unit> NotFound(string message)
        {
            return new ErrorResultBuilder<Unit>(HttpStatusCode.NotFound, message).Build();
        }

        public static IOperationResult<Unit> NotFound()
        {
            return new OperationResult<Unit>(HttpStatusCode.NotFound);
        }

        public static IOperationResult<T> NotFound<T>(string message)
        {
            return new ErrorResultBuilder<T>(HttpStatusCode.NotFound, message).Build();
        }

        public static IOperationResult<T> NotFound<T>()
        {
            return new OperationResult<T>(HttpStatusCode.NotFound);
        }

        public static IOperationResult<Unit> NoContent()
        {
            return new OperationResult<Unit>(HttpStatusCode.NoContent);
        }

        public static IOperationResult<T> Created<T>(T result)
        {
            return new OperationResult<T>(result, HttpStatusCode.Created);
        }
    }
}