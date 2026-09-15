using CommerceEdge.Application.DTOs;
using CommerceEdge.CommerceRuntime.Entities;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.HardwareStation.Payments;
using CommerceEdge.HardwareStation.Scanners;
using Microsoft.Extensions.Logging;

namespace CommerceEdge.HardwareStation.Services;

public sealed class HardwareStationService(
    ICommerceRuntime runtime,
    IReceiptService receipts,
    IBarcodeScanner barcodeScanner,
    ILogger<HardwareStationService> logger) : IHardwareStationService
{
    public async Task<CheckoutResponse> ProcessCheckoutAsync(CheckoutRequest request, CancellationToken ct = default)
    {
        return await runtime.ExecuteAsync<CheckoutRequest, CheckoutResponse>(request, ct);
    }

    public async Task<TenderPaymentResponse> ProcessPaymentAsync(TenderPaymentRequest request, CancellationToken ct = default)
    {
        var response = await runtime.ExecuteAsync<TenderPaymentRequest, TenderPaymentResponse>(request, ct);

        if (response.Success && response.Receipt is not null)
        {
            await PrintReceiptAsync(response.Receipt, ct);
        }

        return response;
    }

    public async Task<AddItemResponse> ScanItemAsync(AddItemRequest request, CancellationToken ct = default)
    {
        var scanResult = await barcodeScanner.ScanAsync(ct);
        if (scanResult is not null)
        {
            request = request with { Sku = scanResult.Sku };
        }

        return await runtime.ExecuteAsync<AddItemRequest, AddItemResponse>(request, ct);
    }

    public async Task<Receipt> GenerateReceiptAsync(OrderDto order, CancellationToken ct = default)
    {
        return receipts.Generate(order);
    }

    private async Task PrintReceiptAsync(Receipt receipt, CancellationToken ct = default)
    {
        try
        {
            logger.LogInformation("Printing receipt for order {OrderNumber}", receipt.OrderNumber);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to print receipt for order {OrderNumber}", receipt.OrderNumber);
        }
    }
}
