using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using PokerTime.API.Asp;
using PokerTime.API.Asp.Exceptions;
using PokerTime.API.SignalR;
using PokerTime.Infrastructure.Common;
using PokerTime.Infrastructure.CQRS;
using PokerTime.Infrastructure.CQRS.Operations;
using PokerTime.Infrastructure.Data;
using PokerTime.Infrastructure.Helpers;
using Serilog;

namespace PokerTime.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAppServices()
                .AddAuth(Configuration)
                .AddHttpContextAccessor()
                .AddMemoryCache()
                .AddSignalR();

            services.AddControllers().AddApplicationPart(typeof(Startup).Assembly).AddNewtonsoftJson(options =>
            {
                options.AllowInputFormatterExceptionMessages = true;
                options.SerializerSettings.Converters.Add(new JsonMapper.UtcDateTimeConverter());
                options.SerializerSettings.Converters.Add(new OperationResultConverter());
            });
            services.AddSwaggerGen(c => { c.SwaggerDoc("v1", new OpenApiInfo { Title = "PokerTime.API", Version = "v1" }); });
            services.AddHandlers(typeof(InfrastructureAssembly).Assembly).WithPipelineValidation();
        }

        public void ConfigureProductionServices(IServiceCollection services)
        {
            ConfigureDevelopmentServices(services);
        }

        public void ConfigureDevelopmentServices(IServiceCollection services)
        {
            ConfigureServices(services);
            services.AddAppDatabase<PokerTimeContext>(Configuration.GetConnectionString("PokerTimeSql"));
        }

        protected virtual void ConfigureAuth(IApplicationBuilder app)
        {
            app.UseAuthentication();
            app.UseAuthorization();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            app.UseCors(policy =>
            {
                var allowedOrigins = Configuration.GetSection("AllowedCorsOrigins").Get<string[]>();
                foreach (var allowedOrigin in allowedOrigins)
                {
                    policy.WithOrigins(allowedOrigin);
                }

                policy.AllowAnyHeader();
                policy.AllowAnyMethod();
                policy.AllowCredentials();
            });


            app.UseSerilogRequestLogging();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "PokerTime.API v1"));
            }

            app.ConfigureExceptionMiddleware(env.IsProduction());

            app.UseHsts();
            app.UseHttpsRedirection();
            app.UseRouting();

            ConfigureAuth(app);

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ClientEventHub>("/hubs/client-events");
            });
        }
    }
}