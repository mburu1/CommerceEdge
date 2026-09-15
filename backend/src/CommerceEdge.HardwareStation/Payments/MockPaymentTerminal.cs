using CommerceEdge.HardwareStation.Devices;
using CommerceEdge.HardwareStation.Payments;

namespace CommerceEdge.HardwareStation.Payments;

public sealed class MockPaymentTerminal : IPaymentTerminal
{
    public string Id { get; } = "PAYMENT-TERMINAL-001";
    public string Name { get; } = "Mock Payment Terminal";
    public string Type { get; } = "PaymentTerminal";
    public DeviceStatus Status { get; private set; } = DeviceStatus.Online;

    private readonly Dictionary<string, PaymentResponse> _transactions = new();
    private readonly object _lock = new();

    public Task<PaymentResponse> AuthorizeAsync(PaymentRequest request, CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;
        var response = new PaymentResponse(
            request.PaymentId,
            Success: true,
            PaymentStatus.Authorized,
            TransactionReference: $"TXN-{Guid.NewGuid():N}",
            ErrorMessage: null);

        lock (_lock)
        {
            _transactions[response.TransactionReference!] = response;
        }

        Status = DeviceStatus.Online;
        return Task.FromResult(response);
    }

    public Task<PaymentResponse> CaptureAsync(string transactionReference, CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;
        var response = new PaymentResponse(
            transactionReference,
            Success: true,
            PaymentStatus.Captured,
            transactionReference,
            ErrorMessage: null);

        lock (_lock)
        {
            if (_transactions.ContainsKey(transactionReference))
            {
                _transactions[transactionReference] = response;
            }
        }

        Status = DeviceStatus.Online;
        return Task.FromResult(response);
    }

    public Task<PaymentResponse> VoidAsync(string transactionReference, CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;
        var response = new PaymentResponse(
            transactionReference,
            Success: true,
            PaymentStatus.Voided,
            transactionReference,
            ErrorMessage: null);

        lock (_lock)
        {
            if (_transactions.ContainsKey(transactionReference))
            {
                _transactions[transactionReference] = response;
            }
        }

        Status = DeviceStatus.Online;
        return Task.FromResult(response);
    }

    public Task<PaymentResponse> RefundAsync(string transactionReference, decimal amount, CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;
        var response = new PaymentResponse(
            transactionReference,
            Success: true,
            PaymentStatus.Refunded,
            transactionReference,
            ErrorMessage: null);

        lock (_lock)
        {
            if (_transactions.ContainsKey(transactionReference))
            {
                _transactions[transactionReference] = response;
            }
        }

        Status = DeviceStatus.Online;
        return Task.FromResult(response);
    }
}
