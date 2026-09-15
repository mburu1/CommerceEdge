namespace CommerceEdge.HardwareStation.Devices;

public interface IDevice
{
    string Id { get; }
    string Name { get; }
    string Type { get; }
    DeviceStatus Status { get; }
}
