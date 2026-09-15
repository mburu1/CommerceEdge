using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.Domain.Enums;
using CommerceEdge.ScaleUnit.Configuration;
using CommerceEdge.ScaleUnit.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CommerceEdge.ScaleUnit.Controllers;

[ApiController]
[Route("scaleunit/checkout")]
[Authorize]
public sealed class CheckoutController(
    ICommerceRuntime runtime,
    IOrderNumberService orderNumbers,
    IOptions<ScaleUnitOptions> options) : ControllerBase
{
    private readonly ScaleUnitOptions _options = options.Value;

    [HttpPost("{cartId:guid}")]
    public async Task<IActionResult> Checkout(Guid cartId, [FromQuery] Guid employeeId, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<CheckoutRequest, CheckoutResponse>(
            new CheckoutRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = employeeId,
                Currency = _options.Currency,
                CartId = cartId,
                OrderNumber = orderNumbers.Generate()
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }

    [HttpPost("orders/{orderId:guid}/tender")]
    public async Task<IActionResult> Tender(Guid orderId, [FromBody] TenderBody body, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<TenderPaymentRequest, TenderPaymentResponse>(
            new TenderPaymentRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = body.EmployeeId,
                Currency = _options.Currency,
                OrderId = orderId,
                Method = body.Method,
                Amount = body.Amount
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }
}

public sealed record TenderBody(Guid EmployeeId, PaymentMethod Method, decimal Amount);
