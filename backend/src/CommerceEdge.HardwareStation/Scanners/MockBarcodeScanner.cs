using CommerceEdge.HardwareStation.Scanners;

namespace CommerceEdge.HardwareStation.Scanners;

public sealed class MockBarcodeScanner : IBarcodeScanner
{
    public string Id { get; } = "BARCODE-SCANNER-001";
    public string Name { get; } = "Mock Barcode Scanner";
    public string Type { get; } = "BarcodeScanner";
    public CommerceEdge.HardwareStation.Devices.DeviceStatus Status { get; private set; } = CommerceEdge.HardwareStation.Devices.DeviceStatus.Online;

    private readonly HashSet<string> _skuCatalog = ["SKU1", "SKU2", "SKU3", "WIDGET-A", "WIDGET-B"];
    private Action<ScanResult>? _onScan;
    private CancellationTokenSource? _cts;

    public Task<ScanResult?> ScanAsync(CancellationToken ct = default)
    {
        Status = CommerceEdge.HardwareStation.Devices.DeviceStatus.Busy;

        var sku = _skuCatalog.ElementAt(new Random().Next(_skuCatalog.Count));
        var result = new ScanResult(sku, sku, 1);

        Status = CommerceEdge.HardwareStation.Devices.DeviceStatus.Online;
        return Task.FromResult<ScanResult?>(result);
    }

    public Task StartListeningAsync(Action<ScanResult> onScan, CancellationToken ct = default)
    {
        Status = CommerceEdge.HardwareStation.Devices.DeviceStatus.Busy;
        _onScan = onScan;
        _cts = CancellationTokenSource.CreateLinkedTokenSource(ct);

        _ = Task.Run(async () =>
        {
            var random = new Random();
            while (!_cts.Token.IsCancellationRequested)
            {
                await Task.Delay(3000, _cts.Token);
                if (_cts.Token.IsCancellationRequested)
                {
                    break;
                }

                var sku = _skuCatalog.ElementAt(random.Next(_skuCatalog.Count));
                var result = new ScanResult(sku, sku, 1);
                _onScan?.Invoke(result);
            }
        }, _cts.Token);

        Status = CommerceEdge.HardwareStation.Devices.DeviceStatus.Online;
        return Task.CompletedTask;
    }

    public Task StopListeningAsync(CancellationToken ct = default)
    {
        _cts?.Cancel();
        Status = CommerceEdge.HardwareStation.Devices.DeviceStatus.Online;
        return Task.CompletedTask;
    }
}
