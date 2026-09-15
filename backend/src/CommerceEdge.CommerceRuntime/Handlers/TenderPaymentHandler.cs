using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Entities;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class TenderPaymentHandler(IOrderService orders, IReceiptService receipts)
    : ICommerceRequestHandler<TenderPaymentRequest, TenderPaymentResponse>
{
    public async Task<TenderPaymentResponse> HandleAsync(TenderPaymentRequest request, CancellationToken ct = default)
    {
        var order = await orders.GetByIdAsync(new GetOrderByIdQuery(request.OrderId), ct);
        if (order is null)
        {
            return CommerceResponse.Fail<TenderPaymentResponse>(request.RequestId, "Order not found.");
        }

        var updated = await orders.AddPaymentAsync(
            new AddOrderPaymentCommand(request.OrderId, request.Method, request.Amount, request.Currency), ct);

        var totalPaid = updated.Payments.Sum(p => p.Amount);
        if (totalPaid >= updated.Total)
        {
            await orders.ConfirmAsync(new ConfirmOrderCommand(request.OrderId), ct);
            updated = await orders.GetByIdAsync(new GetOrderByIdQuery(request.OrderId), ct);
        }

        var receipt = receipts.Generate(updated!);

        return new TenderPaymentResponse
        {
            RequestId = request.RequestId,
            Success = true,
            Order = updated,
            Receipt = receipt
        };
    }
}
