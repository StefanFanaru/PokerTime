using System;
using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;

namespace PokerTime.Infrastructure.Helpers
{
    public static class JsonMapper
    {
        private static readonly JsonSerializerSettings JsonSerializerSettings = new()
        {
            // Don't use CamelCasePropertyNamesContractResolver
            // The CamelCasePropertyNamesContractResolver uses an internal cache that is shared between instances,
            // so sometimes dictionary keys were getting camel cased if the wrong settings got cached.
            ContractResolver = new DefaultContractResolver
            {
                NamingStrategy = new CamelCaseNamingStrategy()
            },
            NullValueHandling = NullValueHandling.Ignore,
            DateTimeZoneHandling = DateTimeZoneHandling.Utc,
            Converters = new List<JsonConverter>
                { new UtcDateTimeConverter(), new StringEnumConverter() }
        };

        public static T FromJson<T>(this string json, JsonSerializerSettings settings)
        {
            return JsonConvert.DeserializeObject<T>(json, settings);
        }

        public static T FromJson<T>(this string json)
        {
            return JsonConvert.DeserializeObject<T>(json, JsonSerializerSettings);
        }

        public static object FromJson(this string json, Type type)
        {
            return JsonConvert.DeserializeObject(json, type, JsonSerializerSettings);
        }

        public static string ToJson<T>(this T obj, JsonSerializerSettings settings = null)
        {
            return JsonConvert.SerializeObject(obj, settings ?? JsonSerializerSettings);
        }

        public class UtcDateTimeConverter : IsoDateTimeConverter
        {
            public override bool CanConvert(Type objectType)
            {
                return objectType == typeof(DateTime) || objectType == typeof(DateTime?);
            }

            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
            {
                writer.WriteValue($"{Convert.ToDateTime(value):yyyy'-'MM'-'dd'T'HH':'mm':'ss.FFF}Z");
            }
        }

        public class UnixDateTimeConverter : DateTimeConverterBase
        {
            public override bool CanConvert(Type objectType)
            {
                return objectType == typeof(DateTime);
            }

            public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
            {
                var t = reader.Value?.ToString() != null ? long.Parse(reader.Value.ToString()!) : 0;
                var dateTimeOffset = DateTimeOffset.FromUnixTimeMilliseconds(t);
                return dateTimeOffset.DateTime;
            }

            [ExcludeFromCodeCoverage]
            public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
            {
                // Not needed
            }
        }
    }
}