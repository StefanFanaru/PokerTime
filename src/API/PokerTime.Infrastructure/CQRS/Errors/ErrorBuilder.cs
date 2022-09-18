using System;
using System.Net;

namespace PokerTime.Infrastructure.CQRS.Errors
{
    public class ErrorBuilder
    {
        private readonly List<Func<ErrorBuilder>> _detailsBuilders = new();
        private readonly HttpStatusCode _errorCode;
        private readonly string _errorMessage;
        private string _target;

        public ErrorBuilder(HttpStatusCode errorCode, string errorMessage)
        {
            _errorCode = errorCode;
            _errorMessage = errorMessage;
        }

        public Error Build()
        {
            return new Error(_errorCode, _errorMessage)
            {
                Details = _detailsBuilders.Select(x => x().Build()).ToList(),
                Target = _target
            };
        }

        public ErrorBuilder ForTarget(string targetString)
        {
            _target = targetString;
            return this;
        }

        public ErrorBuilder WithErrorDetails(Func<ErrorBuilder> detailsErrorBuilder)
        {
            if (detailsErrorBuilder != null)
            {
                _detailsBuilders.Add(detailsErrorBuilder);
            }

            return this;
        }

        public ErrorBuilder WithInner(Func<InnerErrorBuilder> builderAction)
        {
            return this;
        }
    }
}