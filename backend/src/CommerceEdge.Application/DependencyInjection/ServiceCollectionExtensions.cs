using CommerceEdge.Application.Behaviors;
using CommerceEdge.Application.Services;
using CommerceEdge.Application.Validators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CommerceEdge.Application.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IStoreService, StoreService>();
        services.AddScoped<IShiftService, ShiftService>();

        services.AddScoped<LoggingBehavior>();
        services.AddScoped(typeof(ValidationBehavior<>));

        services.AddValidatorsFromAssemblyContaining<CreateProductCommandValidator>();

        return services;
    }
}
