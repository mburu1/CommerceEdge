using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class StartTransactionHandler(ICartService carts)
    : ICommerceRequestHandler<StartTransactionRequest, StartTransactionResponse>
{
    public async Task<StartTransactionResponse> HandleAsync(StartTransactionRequest request, CancellationToken ct = default)
    {
        var cart = await carts.CreateAsync(
            new CreateCartCommand(request.StoreId, request.Currency, request.CustomerId), ct);

        return new StartTransactionResponse
        {
            RequestId = request.RequestId,
            Success = true,
            Cart = cart
        };
    }
}
