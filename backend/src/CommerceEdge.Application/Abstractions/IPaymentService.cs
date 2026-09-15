using CommerceEdge.Domain.Enums;

namespace CommerceEdge.Application.Abstractions;

public interface IPaymentService
{
    Task<PaymentResult> ProcessAsync(PaymentRequest request, CancellationToken ct = default);
    Task<PaymentResult> RefundAsync(RefundRequest request, CancellationToken ct = default);
}

public record PaymentRequest(
    Guid OrderId,
    PaymentMethod Method,
    decimal Amount,
    string Currency,
    string? Reference = null);

public record RefundRequest(
    Guid OrderId,
    Guid PaymentId,
    decimal Amount,
    string Currency);

public record PaymentResult(bool Success, string? TransactionId, string? FailureReason);
