using CommerceEdge.HardwareStation.CashDrawers;
using CommerceEdge.HardwareStation.Devices;

namespace CommerceEdge.HardwareStation.CashDrawers;

public sealed class MockCashDrawer : ICashDrawer
{
    public string Id { get; } = "CASH-DRAWER-001";
    public string Name { get; } = "Mock Cash Drawer";
    public string Type { get; } = "CashDrawer";
    public DeviceStatus Status { get; private set; } = DeviceStatus.Online;
    public CashDrawerState State { get; private set; } = CashDrawerState.Closed;

    public Task OpenAsync(CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;
        State = CashDrawerState.Open;
        Status = DeviceStatus.Online;
        return Task.CompletedTask;
    }

    public Task CloseAsync(CancellationToken ct = default)
    {
        Status = DeviceStatus.Busy;
        State = CashDrawerState.Closed;
        Status = DeviceStatus.Online;
        return Task.CompletedTask;
    }

    public Task<CashDrawerState> GetStateAsync(CancellationToken ct = default)
    {
        return Task.FromResult(State);
    }
}
