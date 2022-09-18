using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using PokerTime.Core.Abstractions;
using PokerTime.Infrastructure.CQRS;
using PokerTime.Infrastructure.Helpers;

namespace PokerTime.API.Asp
{
    public static class AspExtensions
    {
        /// <summary>
        ///     Returns an array of stack traces. Useful for improving JSON readability.
        /// </summary>
        /// <param name="stacktrace">The exception's stacktrace</param>
        /// <returns></returns>
        public static List<string> StackTraceJsonFormatter(string stacktrace)
        {
            var result = new List<string>();
            var split = stacktrace.Replace("\r\n", string.Empty).Split("at ");
            foreach (var trace in split)
            {
                if (!string.IsNullOrWhiteSpace(trace)) // to get rid of the first "at  "
                {
                    result.Add("at " + trace);
                }
            }

            return result;
        }

        public static void AddScopedImplementationsOf(this IServiceCollection services,
            Assembly targetAssembly, Type type, bool onlyImplementationTypes = false)
        {
            var assemblies = new[] { targetAssembly };
            foreach (var validatorType in assemblies.Select(x => x.GetTypes())
                         .SelectMany(Generics.DerivedOf(typeof(IClientEventHandler<>))))
            {
                services.AddScoped(validatorType.ClosedGenericType, validatorType.Type);
            }
        }

        public static void AddScopedImplementationsOf<T>(this IServiceCollection services,
            Assembly targetAssembly, bool onlyImplementationTypes = false)
        {
            targetAssembly ??= Assembly.GetExecutingAssembly();
            var implementationTypes = targetAssembly
                .GetTypes()
                .Where(x => x.IsPublic && x.IsClass)
                .Where(x => x.GetInterfaces().Contains(typeof(T)));

            if (implementationTypes == null || !implementationTypes.Any())
            {
                throw new Exception($"No implementations found for interface {typeof(T).Name}");
            }

            foreach (var implementationType in implementationTypes)
            {
                if (onlyImplementationTypes)
                {
                    services.AddScoped(implementationType);
                    continue;
                }

                services.AddScoped(typeof(T), implementationType);
            }
        }

        public static async Task<T> ReadBodyAsync<T>(this HttpRequest request)
        {
            return (await request.ReadBodyAsync()).FromJson<T>();
        }

        public static async Task<string> ReadBodyAsync(this HttpRequest request)
        {
            string objRequestBody;

            // IMPORTANT: Ensure the requestBody can be read multiple times.
            request.EnableBuffering();

            // IMPORTANT: Leave the body open so the next middleware can read it.
            using (var reader = new StreamReader(
                       request.Body,
                       Encoding.UTF8,
                       false,
                       leaveOpen: true))
            {
                var strRequestBody = await reader.ReadToEndAsync();
                objRequestBody = strRequestBody;

                // IMPORTANT: Reset the request body stream position so the next middleware can read it
                request.Body.Position = 0;
            }

            return objRequestBody;
        }
    }
}