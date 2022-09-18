using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace PokerTime.API.Asp.Auth;

public class ExtensionTokenAuthenticationHandler : AuthenticationHandler<ExtensionTokenAuthenticationOptions>
{
    private readonly IConfiguration _configuration;

    public ExtensionTokenAuthenticationHandler(IOptionsMonitor<ExtensionTokenAuthenticationOptions> options,
        ILoggerFactory logger, UrlEncoder encoder,
        ISystemClock clock, IConfiguration configuration)
        : base(options, logger, encoder, clock)
    {
        _configuration = configuration;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var headers = Request.Headers;

        if (!headers.TryGetValue("Authorization", out var appToken) || string.IsNullOrWhiteSpace(appToken))
        {
            return Task.FromResult(AuthenticateResult.Fail("Token is null or empty"));
        }

        var validationParameters = new TokenValidationParameters
        {
            IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetValue<string>("Secrets:ExtensionCertificate"))),
            ValidateIssuer = true,
            ValidIssuers = new[] { "app.vstoken.visualstudio.com" },
            RequireSignedTokens = true,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ValidateAudience = false,
            ValidateActor = false
        };

        ClaimsPrincipal principal;
        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            principal = tokenHandler.ValidateToken(appToken.ToString().Substring(7), validationParameters, out var token);
        }
        catch (Exception e)
        {
            return Task.FromResult(AuthenticateResult.Fail(e));
        }

        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}