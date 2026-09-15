using CommerceEdge.HardwareStation.Scanners;

namespace CommerceEdge.HardwareStation.Scanners;

public interface IBarcodeScanner : CommerceEdge.HardwareStation.Devices.IDevice
{
    Task<ScanResult?> ScanAsync(CancellationToken ct = default);
    Task StartListeningAsync(Action<ScanResult> onScan, CancellationToken ct = default);
    Task StopListeningAsync(CancellationToken ct = default);
}
