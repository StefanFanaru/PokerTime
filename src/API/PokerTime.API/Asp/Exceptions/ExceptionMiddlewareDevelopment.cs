using System;
using System.Diagnostics;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Serilog;

namespace PokerTime.API.Asp.Exceptions
{
    public class ExceptionMiddlewareDevelopment
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddlewareDevelopment(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                Log.Error($"Exception: {ex.Demystify()}");
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var demystifiedStackTrace = exception.Demystify().StackTrace;
            await context.Response.WriteAsync(new
            {
                Message = $"{exception.GetType().FullName}: {exception.Message}",
                StackTrace = AspExtensions.StackTraceJsonFormatter(demystifiedStackTrace ?? "")
            }.ToString() ?? "Unexpected error");
        }
    }
}