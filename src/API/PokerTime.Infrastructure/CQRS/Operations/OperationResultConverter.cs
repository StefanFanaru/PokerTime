#nullable enable
using System;
using Newtonsoft.Json;

namespace PokerTime.Infrastructure.CQRS.Operations
{
    public class OperationResultConverter : JsonConverter
    {
        public override bool CanRead => false;

        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
        {
            if (value is not IOperationResult<object> r)
            {
                return;
            }

            if (r.IsSuccess)
            {
                serializer.Serialize(writer, r.Result);
                return;
            }

            writer.WriteStartObject();
            writer.WritePropertyName("error");
            serializer.Serialize(writer, r.Error);
            writer.WriteEndObject();
        }

        public override object? ReadJson(JsonReader reader, Type objectType, object? existingValue, JsonSerializer serializer)
        {
            return existingValue;
        }

        public override bool CanConvert(Type objectType)
        {
            return typeof(IOperationResult<object>).IsAssignableFrom(objectType);
        }
    }
}