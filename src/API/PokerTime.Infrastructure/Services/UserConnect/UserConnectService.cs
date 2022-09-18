using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Common.UserInfo;
using PokerTime.Infrastructure.Data.Repositories;
using PokerTime.Infrastructure.Helpers;
using PokerTime.Infrastructure.Services.UserConnect.Dtos;
using Serilog;

namespace PokerTime.Infrastructure.Services.UserConnect;

public class UserConnectService
{
    private readonly IConfiguration _configuration;
    private readonly IRepository _repository;

    public UserConnectService(IConfiguration configuration, IRepository repository)
    {
        _configuration = configuration;
        _repository = repository;
    }

    public async Task<IActionResult> ConnectAsync(ConnectRequest request, CancellationToken cancellationToken)
    {
        var httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri("https://dev.azure.com");
        httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {request.AccessToken}");

        var connectionDataResponse = await httpClient.GetAsync($"{request.OrganizationName}/_apis/connectionData");

        if (!connectionDataResponse.IsSuccessStatusCode)
        {
            Log.Error("Request to /_apis/connectionData failed. StatusCode: {StatusCode}", connectionDataResponse.StatusCode);
            return new ForbidResult();
        }

        var connectionData = (await connectionDataResponse.Content.ReadAsStringAsync()).FromJson<ConnectionDataResponse>();

        if (connectionData.AuthenticatedUser.ProviderDisplayName == "Anonymous")
        {
            return new ForbidResult();
        }

        if (connectionData.AuthorizedUser.ProviderDisplayName == "Anonymous")
        {
            return new ForbidResult();
        }

        if (!connectionData.AuthenticatedUser.IsActive || !connectionData.AuthorizedUser.IsActive)
        {
            return new ForbidResult();
        }

        var projectsResponse =
            await httpClient.GetAsync($"{request.OrganizationName}/_apis/projects?api-version=6.0", cancellationToken);
        if (!projectsResponse.IsSuccessStatusCode)
        {
            Log.Error("Request to /_apis/projects?api-version=6.0 failed. StatusCode: {StatusCode}",
                connectionDataResponse.StatusCode);
            return new ForbidResult();
        }

        var projectsList = (await projectsResponse.Content.ReadAsStringAsync(cancellationToken)).FromJson<ProjectsListResponse>();
        var allowedProjectsIds = projectsList.Value.Select(x => x.Id).ToList();
        await PersistInformation(new Player(connectionData.AuthenticatedUser.Id,
                connectionData.AuthenticatedUser.Properties.Account.Value, connectionData.AuthorizedUser.ProviderDisplayName),
            cancellationToken);

        var claims = new[]
        {
            new Claim(Claims.UserId, connectionData.AuthenticatedUser.Id),
            new Claim(Claims.Name, connectionData.AuthorizedUser.ProviderDisplayName),
            new Claim(Claims.Email, connectionData.AuthenticatedUser.Properties.Account.Value),
            new Claim(Claims.Projects, string.Join(",", allowedProjectsIds)),
            new Claim(Claims.OrganizationId, connectionData.InstanceId),
            new Claim(Claims.OrganizationName, request.OrganizationName)
        };

        Log.Information(
            $"User connected. Email: {connectionData.AuthenticatedUser.Properties.Account.Value}, Id: {connectionData.AuthenticatedUser.Id}");
        return new OkObjectResult(new
        {
            Token = GenerateJsonWebToken(claims, _configuration["Jwt:Issuer"], _configuration["Jwt:Key"],
                _configuration.IsLocal() ? 43200 : 10)
        });
    }

    private async Task PersistInformation(Player user, CancellationToken cancellationToken)
    {
        var userExists = await _repository.Query<Player>().Where(x => x.Id == user.Id).AnyAsync(cancellationToken);
        user.LastConnectedAt = DateTime.UtcNow;
        if (!userExists)
        {
            await _repository.InsertAsync(user);
            Log.Information($"User registered. Email: {user.Email}, Id: {user.Id}");
        }
        else
        {
            _repository.Update(user);
        }

        await _repository.SaveAsync(cancellationToken);
    }

    private static string GenerateJsonWebToken(IEnumerable<Claim> claims, string issuer, string key, int expireInMinutes)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(issuer,
            issuer,
            claims,
            expires: DateTime.Now.AddMinutes(expireInMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}