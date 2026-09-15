using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class LookupCustomerHandler(ICustomerService customers)
    : ICommerceRequestHandler<LookupCustomerRequest, LookupCustomerResponse>
{
    public async Task<LookupCustomerResponse> HandleAsync(LookupCustomerRequest request, CancellationToken ct = default)
    {
        var customer = await customers.GetByEmailAsync(new GetCustomerByEmailQuery(request.Email), ct);
        if (customer is null)
        {
            return CommerceResponse.Fail<LookupCustomerResponse>(request.RequestId, $"No customer found for '{request.Email}'.");
        }

        return new LookupCustomerResponse { RequestId = request.RequestId, Success = true, Customer = customer };
    }
}

public sealed class AttachCustomerHandler(ICartService carts, ICustomerService customers)
    : ICommerceRequestHandler<AttachCustomerRequest, AttachCustomerResponse>
{
    public async Task<AttachCustomerResponse> HandleAsync(AttachCustomerRequest request, CancellationToken ct = default)
    {
        var customer = await customers.GetByIdAsync(new GetCustomerByIdQuery(request.CustomerId), ct);
        if (customer is null)
        {
            return CommerceResponse.Fail<AttachCustomerResponse>(request.RequestId, "Customer not found.");
        }

        // Re-create cart with customer attached — cart is immutable on CustomerId after creation,
        // so we abandon the current one and start a new cart with the customer.
        var existing = await carts.GetByIdAsync(new Application.Queries.GetCartByIdQuery(request.CartId), ct);
        if (existing is null)
        {
            return CommerceResponse.Fail<AttachCustomerResponse>(request.RequestId, "Cart not found.");
        }

        await carts.AbandonAsync(new Application.Commands.AbandonCartCommand(request.CartId), ct);

        var newCart = await carts.CreateAsync(
            new Application.Commands.CreateCartCommand(request.StoreId, existing.Currency, request.CustomerId), ct);

        foreach (var line in existing.Lines)
        {
            await carts.AddLineAsync(new Application.Commands.AddCartLineCommand(
                newCart.Id, line.ProductId, line.VariantId,
                line.ProductName, line.Sku, line.UnitPrice, existing.Currency, line.Quantity), ct);
        }

        var updated = await carts.GetByIdAsync(new Application.Queries.GetCartByIdQuery(newCart.Id), ct);
        return new AttachCustomerResponse { RequestId = request.RequestId, Success = true, Cart = updated };
    }
}
