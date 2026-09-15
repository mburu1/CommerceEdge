namespace CommerceEdge.HardwareStation.Payments;

public record PaymentResponse(
    string PaymentId,
    bool Success,
    PaymentStatus Status,
    string? TransactionReference,
    string? ErrorMessage);
