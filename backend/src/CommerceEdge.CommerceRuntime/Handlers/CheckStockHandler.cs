using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class CheckStockHandler(IInventoryService inventory)
    : ICommerceRequestHandler<CheckStockRequest, CheckStockResponse>
{
    public async Task<CheckStockResponse> HandleAsync(CheckStockRequest request, CancellationToken ct = default)
    {
        var stock = await inventory.GetBySkuAsync(new GetInventoryBySkuQuery(request.StoreId, request.Sku), ct);
        if (stock is null)
        {
            return CommerceResponse.Fail<CheckStockResponse>(request.RequestId, $"No inventory record for '{request.Sku}' at this store.");
        }

        return new CheckStockResponse { RequestId = request.RequestId, Success = true, Inventory = stock };
    }
}
