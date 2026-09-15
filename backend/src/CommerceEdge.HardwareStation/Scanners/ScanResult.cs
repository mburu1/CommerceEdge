namespace CommerceEdge.HardwareStation.Scanners;

public record ScanResult(
    string Sku,
    string? ProductName,
    int Quantity);
