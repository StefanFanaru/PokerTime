using System;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Common;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.CQRS;

namespace PokerTime.Infrastructure.ClientEvents;

public static class ClientEventsHelpers
{
    public static async Task CallClientEventHandler(this IServiceProvider serviceProvider,
        ClientEventType eventType, string playerId, string payload)
    {
        var typeEntries = Generics.DerivedOf(Assembly.GetExecutingAssembly().GetTypes(), typeof(IClientEventHandler<>));
        var handlerTypeEntries = typeEntries.Where(typeEntry =>
        {
            var eventTypeAttribute = typeEntry.Type.GetCustomAttribute<ClientEventTypeAttribute>();

            if (eventTypeAttribute == null)
            {
                throw new InvalidOperationException(
                    $"Found ClientEvent handler with no EventTypeAttribute value: {typeEntry.Type.FullName}");
            }

            return eventTypeAttribute.Name == eventType.ToString();
        }).ToList();

        if (handlerTypeEntries.Count > 1)
        {
            throw new InvalidOperationException(
                $"Found multiple ClientEvent handlers for event type: {eventType}");
        }

        if (handlerTypeEntries.Count == 0)
        {
            throw new InvalidOperationException(
                $"Could not find ClientEvent handler for event type: {eventType}");
        }

        var handlerTypeEntry = handlerTypeEntries.Single();
        var handler = serviceProvider.GetRequiredService(handlerTypeEntry.ClosedGenericType);
        var payloadObject = new[]
        {
            playerId, JsonConvert.DeserializeObject(payload, handlerTypeEntry.ClosedGenericType.GenericTypeArguments.Single())
        };

        await ((Task)handlerTypeEntry.Type.GetMethod("Handle")!.Invoke(handler, payloadObject))!;
    }
}