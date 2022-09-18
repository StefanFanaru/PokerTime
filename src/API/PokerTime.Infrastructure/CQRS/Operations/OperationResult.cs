using System.Net;
using PokerTime.Infrastructure.CQRS.Errors;

namespace PokerTime.Infrastructure.CQRS.Operations
{
    public class OperationResult<TResult> : IOperationResult<TResult>
    {
        public OperationResult(bool isSuccess, bool hasResult, Error error, TResult result, HttpStatusCode statusCode)
        {
            Result = result;
            IsSuccess = isSuccess;
            Error = error;
            HasResult = hasResult;
            StatusCode = statusCode;
        }

        public OperationResult(HttpStatusCode statusCode) : this(true, false, null, default, statusCode)
        {
        }

        public OperationResult(TResult result, HttpStatusCode statusCode) : this(true, true, null, result, statusCode)
        {
        }

        public OperationResult(Error error) : this(false, false, error, default, HttpStatusCode.InternalServerError)
        {
        }

        public bool HasResult { get; }
        public TResult Result { get; }
        public bool IsSuccess { get; }
        public Error Error { get; }
        public HttpStatusCode StatusCode { get; set; }
    }
}