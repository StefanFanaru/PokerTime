using Microsoft.Extensions.Configuration;

namespace PokerTime.Infrastructure.Helpers;

public static class ConfigurationHelpers
{
    public static bool IsLocal(this IConfiguration configuration)
    {
        return configuration["Settings:Environment"] == "local";
    }
}