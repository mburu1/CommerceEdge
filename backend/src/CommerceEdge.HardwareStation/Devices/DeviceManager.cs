namespace CommerceEdge.HardwareStation.Devices;

public sealed class DeviceManager : IDeviceManager
{
    private readonly List<DeviceInfo> _devices = [];
    private readonly object _lock = new();

    public IReadOnlyList<DeviceInfo> ListDevices()
    {
        lock (_lock)
        {
            return _devices.ToList();
        }
    }

    public DeviceInfo? GetDevice(string deviceId)
    {
        lock (_lock)
        {
            return _devices.FirstOrDefault(d => d.Id == deviceId);
        }
    }

    public bool IsDeviceConnected(string deviceId)
    {
        var device = GetDevice(deviceId);
        return device?.Status == DeviceStatus.Online;
    }

    public void RegisterDevice(DeviceInfo device)
    {
        lock (_lock)
        {
            var existing = _devices.FirstOrDefault(d => d.Id == device.Id);
            if (existing is not null)
            {
                _devices.Remove(existing);
            }
            _devices.Add(device);
        }
    }

    public void UpdateStatus(string deviceId, DeviceStatus status)
    {
        lock (_lock)
        {
            var device = _devices.FirstOrDefault(d => d.Id == deviceId);
            if (device is not null)
            {
                _devices.Remove(device);
                _devices.Add(device with { Status = status });
            }
        }
    }
}
