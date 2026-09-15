using CommerceEdge.Application.DTOs;
using CommerceEdge.CommerceRuntime.Entities;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.HardwareStation.Payments;
using CommerceEdge.HardwareStation.Scanners;

namespace CommerceEdge.HardwareStation.Services;

public interface IHardwareStationService
{
    Task<CheckoutResponse> ProcessCheckoutAsync(CheckoutRequest request, CancellationToken ct = default);
    Task<TenderPaymentResponse> ProcessPaymentAsync(TenderPaymentRequest request, CancellationToken ct = default);
    Task<AddItemResponse> ScanItemAsync(AddItemRequest request, CancellationToken ct = default);
    Task<Receipt> GenerateReceiptAsync(OrderDto order, CancellationToken ct = default);
}
