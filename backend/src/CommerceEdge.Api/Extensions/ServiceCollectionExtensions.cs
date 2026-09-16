using System.Text;
using CommerceEdge.Api.Observability;
using CommerceEdge.Observability.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace CommerceEdge.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration config)
    {
        var jwtSection = config.GetSection("Jwt");
        var secret = jwtSection["SecretKey"] ?? throw new InvalidOperationException("Jwt:SecretKey is not configured.");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opts =>
            {
                opts.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSection["Issuer"],
                    ValidAudience = jwtSection["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
                };
            });

        services.AddAuthorization();

        services.AddCors(opts =>
        {
            opts.AddDefaultPolicy(p => p
                .WithOrigins(config.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:5173"])
                .AllowAnyHeader()
                .AllowAnyMethod());
        });

        services.AddOpenApi();

        return services;
    }

    public static IServiceCollection AddApiHealthChecks(this IServiceCollection services)
    {
        services.AddCommerceEdgeHealthChecks(healthChecks =>
        {
            healthChecks.AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);
            healthChecks.AddCheck<RedisHealthCheck>("redis", tags: ["ready"]);
        });

        return services;
    }
}
