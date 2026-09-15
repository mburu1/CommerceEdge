namespace CommerceEdge.HardwareStation.Devices;

public interface IDeviceManager
{
    IReadOnlyList<DeviceInfo> ListDevices();
    DeviceInfo? GetDevice(string deviceId);
    bool IsDeviceConnected(string deviceId);
}
