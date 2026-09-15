namespace CommerceEdge.HardwareStation.Devices;

public record DeviceInfo(
    string Id,
    string Name,
    string Type,
    DeviceStatus Status);
