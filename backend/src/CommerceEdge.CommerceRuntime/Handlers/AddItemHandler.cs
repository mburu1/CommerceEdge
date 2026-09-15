using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.Domain.Enums;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class AddItemHandler(IProductService products, IInventoryService inventory, ICartService carts)
    : ICommerceRequestHandler<AddItemRequest, AddItemResponse>
{
    public async Task<AddItemResponse> HandleAsync(AddItemRequest request, CancellationToken ct = default)
    {
        var product = await products.GetBySkuAsync(new GetProductBySkuQuery(request.Sku), ct);
        if (product is null)
        {
            return CommerceResponse.Fail<AddItemResponse>(request.RequestId, $"Product '{request.Sku}' not found.");
        }

        if (product.Status != ProductStatus.Active.ToString())
        {
            return CommerceResponse.Fail<AddItemResponse>(request.RequestId, $"Product '{request.Sku}' is not available for sale.");
        }

        var stock = await inventory.GetBySkuAsync(new GetInventoryBySkuQuery(request.StoreId, request.Sku), ct);
        if (stock is null || stock.QuantityAvailable < request.Quantity)
        {
            return CommerceResponse.Fail<AddItemResponse>(request.RequestId, $"Insufficient stock for '{request.Sku}'.");
        }

        var cart = await carts.AddLineAsync(new AddCartLineCommand(
            request.CartId,
            product.Id,
            null,
            product.Name,
            product.Sku,
            product.BasePrice,
            request.Currency,
            request.Quantity), ct);

        return new AddItemResponse { RequestId = request.RequestId, Success = true, Cart = cart };
    }
}
