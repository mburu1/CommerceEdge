using CommerceEdge.HardwareStation.CashDrawers;
using CommerceEdge.HardwareStation.Devices;

namespace CommerceEdge.HardwareStation.CashDrawers;

public interface ICashDrawer : IDevice
{
    CashDrawerState State { get; }
    Task OpenAsync(CancellationToken ct = default);
    Task CloseAsync(CancellationToken ct = default);
    Task<CashDrawerState> GetStateAsync(CancellationToken ct = default);
}
