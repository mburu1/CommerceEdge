using CommerceEdge.CommerceRuntime.Entities;
using CommerceEdge.HardwareStation.Devices;
using CommerceEdge.HardwareStation.CashDrawers;

namespace CommerceEdge.HardwareStation.Printers;

public sealed class MockReceiptPrinter : IReceiptPrinter
{
    public string Id { get; } = "RECEIPT-PRINTER-001";
    public string Name { get; } = "Mock Receipt Printer";
    public string Type { get; } = "ReceiptPrinter";
    public DeviceStatus Status { get; private set; } = DeviceStatus.Online;

    private readonly ICashDrawer _cashDrawer;
    private readonly List<string> _printedLines = [];
    private readonly object _lock = new();

    public MockReceiptPrinter(ICashDrawer cashDrawer)
    {
        _cashDrawer = cashDrawer;
    }

    public Task PrintAsync(Receipt receipt, CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;

        lock (_lock)
        {
            _printedLines.Clear();
            _printedLines.Add($"=== RECEIPT ===");
            _printedLines.Add($"Order: {receipt.OrderNumber}");
            _printedLines.Add($"Store: {receipt.StoreId}");
            _printedLines.Add($"Issued: {receipt.IssuedAt:O}");
            _printedLines.Add($"---");

            foreach (var line in receipt.Lines)
            {
                _printedLines.Add($"{line.ProductName} ({line.Sku}) x{line.Quantity} @ {line.UnitPrice} = {line.LineTotal}");
            }

            _printedLines.Add($"---");
            _printedLines.Add($"Subtotal: {receipt.Subtotal}");
            _printedLines.Add($"Tax: {receipt.TaxAmount}");
            _printedLines.Add($"Total: {receipt.Total}");
            _printedLines.Add($"Currency: {receipt.Currency}");
            _printedLines.Add($"---");

            foreach (var payment in receipt.Payments)
            {
                _printedLines.Add($"{payment.Method}: {payment.Amount}");
            }

            _printedLines.Add($"=== END ===");
        }

        _ = _cashDrawer.OpenAsync(ct);
        Status = DeviceStatus.Online;
        return Task.CompletedTask;
    }

    public Task PrintLineAsync(string line, CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;
        lock (_lock)
        {
            _printedLines.Add(line);
        }
        Status = DeviceStatus.Online;
        return Task.CompletedTask;
    }

    public Task OpenCashDrawerAsync(CancellationToken ct = default)
    {
        return _cashDrawer.OpenAsync(ct);
    }
}
