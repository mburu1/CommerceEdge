using System.Text;
using CommerceEdge.ScaleUnit.Configuration;
using CommerceEdge.ScaleUnit.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace CommerceEdge.ScaleUnit.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddScaleUnit(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<ScaleUnitOptions>(config.GetSection(ScaleUnitOptions.Section));
        services.Configure<JwtOptions>(config.GetSection(JwtOptions.Section));

        services.AddScoped<IOrderNumberService, OrderNumberService>();

        var jwtSection = config.GetSection(JwtOptions.Section);
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
}
