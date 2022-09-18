using Microsoft.AspNetCore.Builder;

namespace PokerTime.API.Asp.Exceptions
{
    public static class ExceptionMiddlewareExtensions
    {
        public static void ConfigureExceptionMiddleware(this IApplicationBuilder app, bool isDevelopment)
        {
            if (isDevelopment)
            {
                app.UseMiddleware<ExceptionMiddlewareDevelopment>();
                return;
            }

            app.UseMiddleware<ExceptionMiddlewareProduction>();
        }
    }
}