namespace CommerceEdge.HardwareStation.Payments;

public interface IPaymentTerminal : CommerceEdge.HardwareStation.Devices.IDevice
{
    Task<PaymentResponse> AuthorizeAsync(PaymentRequest request, CancellationToken ct = default);
    Task<PaymentResponse> CaptureAsync(string transactionReference, CancellationToken ct = default);
    Task<PaymentResponse> VoidAsync(string transactionReference, CancellationToken ct = default);
    Task<PaymentResponse> RefundAsync(string transactionReference, decimal amount, CancellationToken ct = default);
}
