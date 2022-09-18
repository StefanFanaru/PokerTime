using System;
using Newtonsoft.Json.Linq;
using PokerTime.Core.Abstractions;
using PokerTime.Core.Enums;
using PokerTime.Infrastructure.Helpers;

namespace PokerTime.Infrastructure.ClientEvents
{
    public sealed class ClientEvent
    {
        public ClientEvent(IClientEvent innerEvent)
        {
            InnerEventJson = JObject.Parse(innerEvent.ToJson());
            Type = innerEvent.Type;
            CreatedAt = DateTime.UtcNow;
        }

        public JObject InnerEventJson { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public string GameId { get; set; }

        public ClientEventType Type { get; private set; }
    }
}