using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PokerTime.Infrastructure.CQRS.Operations;

namespace PokerTime.Infrastructure.CQRS
{
    public static class CommandAndQueries
    {
        public static CommandAndQueriesComposition AddHandlers(this IServiceCollection services,
            params Assembly[] assemblies)
        {
            services.AddMediatR(assemblies);

            foreach (var validatorType in assemblies.Select(x => x.GetTypes())
                         .SelectMany(Generics.DerivedOf(typeof(IValidator<>))))
            {
                services.AddTransient(validatorType.ClosedGenericType, validatorType.Type);
            }

            return new CommandAndQueriesComposition(services);
        }
    }

    public class CommandAndQueriesComposition
    {
        private readonly IServiceCollection _services;

        public CommandAndQueriesComposition(IServiceCollection services)
        {
            _services = services;
        }

        public IServiceCollection WithPipelineValidation()
        {
            foreach (var service in Generics.DerivedOf(typeof(IRequestHandler<,>))(_services.Select(x => x.ServiceType).ToList()))
            {
                var hasValidator = service.Param1.Assembly
                    .GetTypes().Any(x => x.BaseType == typeof(AbstractValidator<>).MakeGenericType(service.Param1));

                if (!hasValidator)
                {
                    continue;
                }

                var resultEntry = Generics.MatchForOpenGenerics(service.Param2, typeof(IOperationResult<>));

                if (resultEntry != null)
                {
                    _services.AddTransient(typeof(IPipelineBehavior<,>).MakeGenericType(service.Param1, service.Param2),
                        typeof(ValidationBehaviour<,>).MakeGenericType(service.Param1, resultEntry.Param1));
                }
            }

            return _services;
        }
    }
}