using CommerceEdge.Application.DTOs;
using CommerceEdge.CommerceRuntime.Entities;

namespace CommerceEdge.CommerceRuntime.Services;

public sealed class ReceiptService : IReceiptService
{
    public Receipt Generate(OrderDto order) => new()
    {
        OrderNumber = order.OrderNumber,
        StoreId = order.StoreId,
        CustomerId = order.CustomerId,
        Subtotal = order.Subtotal,
        TaxAmount = order.TaxAmount,
        Total = order.Total,
        Currency = order.Currency,
        Lines = order.Lines
            .Select(l => new ReceiptLine
            {
                ProductName = l.ProductName,
                Sku = l.Sku,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                LineTotal = l.LineTotal
            })
            .ToList(),
        Payments = order.Payments
            .Select(p => new ReceiptPayment
            {
                Method = p.Method,
                Amount = p.Amount,
                Currency = p.Currency
            })
            .ToList()
    };
}
