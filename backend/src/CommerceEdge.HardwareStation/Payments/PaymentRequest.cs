namespace CommerceEdge.HardwareStation.Payments;

public record PaymentRequest(
    string PaymentId,
    decimal Amount,
    string Currency,
    string Method);
