using CommerceEdge.Application.Abstractions;
using CommerceEdge.Domain.Repositories;
using CommerceEdge.Infrastructure.Caching;
using CommerceEdge.Infrastructure.Integrations;
using CommerceEdge.Infrastructure.Messaging;
using CommerceEdge.Infrastructure.Observability;
using CommerceEdge.Infrastructure.Persistence;
using CommerceEdge.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace CommerceEdge.Infrastructure.DependencyInjection;

/// <summary>
/// Cross-cutting infrastructure: EF Core persistence, Redis caching/messaging,
/// domain-event dispatching and the supporting abstractions.
/// </summary>
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IStoreRepository, StoreRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IShiftRepository, ShiftRepository>();

        var redisConnectionString = config.GetConnectionString("Redis")
                                    ?? config["Redis:ConnectionString"]
                                    ?? "localhost:6379";

        services.AddSingleton<IConnectionMultiplexer>(sp =>
            ConnectionMultiplexer.Connect(redisConnectionString));

        services.AddSingleton<ICacheService, RedisCacheService>();
        services.AddSingleton<IEventPublisher, RedisEventPublisher>();
        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }
}
