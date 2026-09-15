using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CommerceEdge.CommerceRuntime.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCommerceRuntime(this IServiceCollection services)
    {
        // Runtime dispatcher
        services.AddScoped<ICommerceRuntime, CommerceRuntimeService>();

        // Receipt
        services.AddScoped<IReceiptService, ReceiptService>();

        // Handlers
        services.AddScoped<ICommerceRequestHandler<StartTransactionRequest, StartTransactionResponse>, StartTransactionHandler>();
        services.AddScoped<ICommerceRequestHandler<AddItemRequest, AddItemResponse>, AddItemHandler>();
        services.AddScoped<ICommerceRequestHandler<RemoveItemRequest, RemoveItemResponse>, RemoveItemHandler>();
        services.AddScoped<ICommerceRequestHandler<VoidTransactionRequest, VoidTransactionResponse>, VoidTransactionHandler>();
        services.AddScoped<ICommerceRequestHandler<CheckoutRequest, CheckoutResponse>, CheckoutHandler>();
        services.AddScoped<ICommerceRequestHandler<TenderPaymentRequest, TenderPaymentResponse>, TenderPaymentHandler>();
        services.AddScoped<ICommerceRequestHandler<LookupCustomerRequest, LookupCustomerResponse>, LookupCustomerHandler>();
        services.AddScoped<ICommerceRequestHandler<AttachCustomerRequest, AttachCustomerResponse>, AttachCustomerHandler>();
        services.AddScoped<ICommerceRequestHandler<OpenShiftRequest, OpenShiftResponse>, OpenShiftHandler>();
        services.AddScoped<ICommerceRequestHandler<CloseShiftRequest, CloseShiftResponse>, CloseShiftHandler>();
        services.AddScoped<ICommerceRequestHandler<CheckStockRequest, CheckStockResponse>, CheckStockHandler>();

        return services;
    }
}
