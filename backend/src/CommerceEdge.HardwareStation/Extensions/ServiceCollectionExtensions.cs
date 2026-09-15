using CommerceEdge.HardwareStation.CashDrawers;
using CommerceEdge.HardwareStation.Devices;
using CommerceEdge.HardwareStation.Payments;
using CommerceEdge.HardwareStation.Printers;
using CommerceEdge.HardwareStation.Scanners;
using CommerceEdge.HardwareStation.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CommerceEdge.HardwareStation.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHardwareStation(this IServiceCollection services)
    {
        services.AddSingleton<IDeviceManager, DeviceManager>();

        services.AddSingleton<IPaymentTerminal, MockPaymentTerminal>();
        services.AddSingleton<IBarcodeScanner, MockBarcodeScanner>();
        services.AddSingleton<ICashDrawer, MockCashDrawer>();
        services.AddSingleton<IReceiptPrinter>(sp =>
        {
            var cashDrawer = sp.GetRequiredService<ICashDrawer>();
            return new MockReceiptPrinter(cashDrawer);
        });

        services.AddScoped<IHardwareStationService, HardwareStationService>();

        return services;
    }
}
