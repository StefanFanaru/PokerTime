using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PokerTime.API.Asp.Auth;
using PokerTime.API.Common;
using PokerTime.API.SignalR;
using PokerTime.Core.Abstractions;
using PokerTime.Infrastructure.Common;
using PokerTime.Infrastructure.Common.UserInfo;
using PokerTime.Infrastructure.Data;
using PokerTime.Infrastructure.Data.DataMigrations;
using PokerTime.Infrastructure.Data.Repositories;
using PokerTime.Infrastructure.Services.UserConnect;

namespace PokerTime.API.Asp;

public static class ApiConfiguration
{
    public static IServiceCollection AddAppServices(this IServiceCollection services)
    {
        services.AddScoped<IRepository, Repository>();
        services.AddScoped<IDataMigrator, DataMigrator>();
        services.AddScoped<IUserInfo, AspUserInfo>();
        services.AddScoped<UserConnectService>();
        services.AddScoped<IAuthorizationHandler, AllowedInProjectAuthorizationHandler>();
        services.AddScoped<IClientEventSender, ClientEventSender>();
        services.AddSingleton<ISignalRConnectionManager, SignalRConnectionManager>();

        services.AddScopedImplementationsOf<IDataMigration>(typeof(InfrastructureAssembly).Assembly);
        services.AddScopedImplementationsOf(typeof(InfrastructureAssembly).Assembly, typeof(IClientEventHandler<>));
        return services;
    }

    public static IServiceCollection AddAuth(this IServiceCollection services, IConfiguration configuration)
    {
        JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
                };
            }).AddScheme<ExtensionTokenAuthenticationOptions,
                ExtensionTokenAuthenticationHandler>(AuthenticationSchemeNames.ExtensionToken, o => { });

        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy("AllowedInProject",
                policyBuilder => policyBuilder.AddRequirements(new AllowedInProjectRequirement()));
        });

        services.TryAddEnumerable(
            ServiceDescriptor.Singleton<IPostConfigureOptions<JwtBearerOptions>,
                ConfigureJwtBearerOptions>());
        return services;
    }

    public static async Task InitializeApp(this IServiceProvider serviceProvider)
    {
        await serviceProvider.InitializeDatabase<PokerTimeContext>();
    }
}