using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PokerTime.API.Asp;
using Serilog;
using Serilog.Events;

namespace PokerTime.API
{
    public class Program
    {
        public static async Task<int> Main(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", false)
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json", true)
                .AddCommandLine(args)
                .Build();

            var logConfiguration = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration);

            if (configuration["Settings:Environment"] == "production")
                logConfiguration.WriteTo.ApplicationInsights(
                    configuration["ApplicationInsights:InstrumentationKey"], TelemetryConverter.Traces, LogEventLevel.Error);

            Log.Logger = logConfiguration.CreateLogger();

            try
            {
                var host = CreateHostBuilder(args).Build();
                var services = host.Services.CreateScope().ServiceProvider;
                await services.InitializeApp();

                Log.Information("Starting host...");
                await host.RunAsync();
                return 0;
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Host terminated unexpectedly");
                return 1;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        private static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .UseSerilog()
                .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); });
        }
    }
}