using System.Net;

namespace PokerTime.Infrastructure.CQRS.Errors
{
    public class Error
    {
        public Error(HttpStatusCode statusCode, string message)
        {
            StatusCode = statusCode;
            Message = message;
        }

        public HttpStatusCode StatusCode { get; }
        public string Message { get; }
        public string Target { get; set; }
        public List<Error> Details { get; set; }
    }
}