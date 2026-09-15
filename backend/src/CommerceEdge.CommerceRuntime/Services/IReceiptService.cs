using CommerceEdge.Application.DTOs;
using CommerceEdge.CommerceRuntime.Entities;

namespace CommerceEdge.CommerceRuntime.Services;

public interface IReceiptService
{
    Receipt Generate(OrderDto order);
}
