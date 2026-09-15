using CommerceEdge.CommerceRuntime.Entities;

namespace CommerceEdge.HardwareStation.Printers;

public interface IReceiptPrinter : CommerceEdge.HardwareStation.Devices.IDevice
{
    Task PrintAsync(Receipt receipt, CancellationToken ct = default);
    Task PrintLineAsync(string line, CancellationToken ct = default);
    Task OpenCashDrawerAsync(CancellationToken ct = default);
}
