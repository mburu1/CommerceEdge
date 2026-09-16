using System.Diagnostics.Metrics;
using CommerceEdge.Application.DTOs;
using CommerceEdge.CommerceRuntime.Entities;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.HardwareStation.Payments;
using CommerceEdge.HardwareStation.Scanners;
using CommerceEdge.Observability;
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
        using var operation = CommerceEdgeTelemetry.Measure("hardware_station.checkout");
        try
        {
            var response = await runtime.ExecuteAsync<CheckoutRequest, CheckoutResponse>(request, ct);
            if (!response.Success)
            {
                operation.MarkFailed();
            }

            return response;
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            logger.LogError(ex, "Checkout failed");
            throw;
        }
    }

    public async Task<TenderPaymentResponse> ProcessPaymentAsync(TenderPaymentRequest request, CancellationToken ct = default)
    {
        using var operation = CommerceEdgeTelemetry.Measure("hardware_station.payment");
        try
        {
            var response = await runtime.ExecuteAsync<TenderPaymentRequest, TenderPaymentResponse>(request, ct);
            if (!response.Success)
            {
                operation.MarkFailed();
            }
            else if (response.Receipt is not null)
            {
                await PrintReceiptAsync(response.Receipt, ct);
            }

            CommerceEdgeTelemetry.PaymentDuration.Record(operation.ElapsedSeconds, new System.Diagnostics.TagList
            {
                { "success", response.Success ? "true" : "false" }
            });
            return response;
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            CommerceEdgeTelemetry.PaymentDuration.Record(operation.ElapsedSeconds, new System.Diagnostics.TagList
            {
                { "success", "false" }
            });
            logger.LogError(ex, "Payment failed");
            throw;
        }
    }

    public async Task<AddItemResponse> ScanItemAsync(AddItemRequest request, CancellationToken ct = default)
    {
        using var operation = CommerceEdgeTelemetry.Measure("hardware_station.scan");
        try
        {
            var scanResult = await barcodeScanner.ScanAsync(ct);
            if (scanResult is not null)
            {
                request = request with { Sku = scanResult.Sku };
            }

            var response = await runtime.ExecuteAsync<AddItemRequest, AddItemResponse>(request, ct);
            if (!response.Success)
            {
                operation.MarkFailed();
            }

            return response;
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            logger.LogError(ex, "Item scan failed");
            throw;
        }
    }

    public async Task<Receipt> GenerateReceiptAsync(OrderDto order, CancellationToken ct = default)
    {
        using var operation = CommerceEdgeTelemetry.Measure("hardware_station.receipt.generate");
        try
        {
            return receipts.Generate(order);
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            logger.LogError(ex, "Receipt generation failed");
            throw;
        }
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
