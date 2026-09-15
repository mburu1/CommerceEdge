using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class CheckoutHandler(ICartService carts, IOrderService orders, IInventoryService inventory)
    : ICommerceRequestHandler<CheckoutRequest, CheckoutResponse>
{
    public async Task<CheckoutResponse> HandleAsync(CheckoutRequest request, CancellationToken ct = default)
    {
        var cart = await carts.GetByIdAsync(new GetCartByIdQuery(request.CartId), ct);
        if (cart is null)
        {
            return CommerceResponse.Fail<CheckoutResponse>(request.RequestId, "Cart not found.");
        }

        if (cart.Lines.Count == 0)
        {
            return CommerceResponse.Fail<CheckoutResponse>(request.RequestId, "Cannot checkout an empty cart.");
        }

        // Create order from cart
        var order = await orders.CreateAsync(new CreateOrderCommand(
            request.OrderNumber, request.StoreId, cart.Currency, cart.CustomerId, cart.Id), ct);

        // Transfer lines
        foreach (var line in cart.Lines)
        {
            await orders.AddLineAsync(new AddOrderLineCommand(
                order.Id, line.ProductId, line.VariantId,
                line.ProductName, line.Sku, line.UnitPrice, cart.Currency, line.Quantity), ct);
        }

        // Reserve inventory for each line
        foreach (var line in cart.Lines)
        {
            var stock = await inventory.GetBySkuAsync(new GetInventoryBySkuQuery(request.StoreId, line.Sku), ct);
            if (stock is not null)
            {
                await inventory.ReserveAsync(new ReserveInventoryCommand(stock.Id, line.Quantity), ct);
            }
        }

        // Mark cart as checked out
        await carts.CheckoutAsync(new CheckoutCartCommand(request.CartId), ct);

        var confirmed = await orders.GetByIdAsync(new GetOrderByIdQuery(order.Id), ct);
        return new CheckoutResponse { RequestId = request.RequestId, Success = true, Order = confirmed };
    }
}
