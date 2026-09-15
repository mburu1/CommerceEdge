using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class RemoveItemHandler(ICartService carts)
    : ICommerceRequestHandler<RemoveItemRequest, RemoveItemResponse>
{
    public async Task<RemoveItemResponse> HandleAsync(RemoveItemRequest request, CancellationToken ct = default)
    {
        var cart = await carts.GetByIdAsync(new GetCartByIdQuery(request.CartId), ct);
        if (cart is null)
        {
            return CommerceResponse.Fail<RemoveItemResponse>(request.RequestId, "Cart not found.");
        }

        await carts.RemoveLineAsync(new RemoveCartLineCommand(request.CartId, request.LineId), ct);
        var updated = await carts.GetByIdAsync(new GetCartByIdQuery(request.CartId), ct);

        return new RemoveItemResponse { RequestId = request.RequestId, Success = true, Cart = updated };
    }
}

public sealed class VoidTransactionHandler(ICartService carts)
    : ICommerceRequestHandler<VoidTransactionRequest, VoidTransactionResponse>
{
    public async Task<VoidTransactionResponse> HandleAsync(VoidTransactionRequest request, CancellationToken ct = default)
    {
        await carts.AbandonAsync(new AbandonCartCommand(request.CartId), ct);
        return new VoidTransactionResponse { RequestId = request.RequestId, Success = true };
    }
}
