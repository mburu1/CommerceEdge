namespace CommerceEdge.HardwareStation.Payments;

public enum PaymentStatus
{
    Pending,
    Authorized,
    Captured,
    Voided,
    Refunded,
    Failed
}
