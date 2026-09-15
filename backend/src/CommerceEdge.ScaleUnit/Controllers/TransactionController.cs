using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.ScaleUnit.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CommerceEdge.ScaleUnit.Controllers;

[ApiController]
[Route("scaleunit/transactions")]
[Authorize]
public sealed class TransactionController(ICommerceRuntime runtime, IOptions<ScaleUnitOptions> options) : ControllerBase
{
    private readonly ScaleUnitOptions _options = options.Value;

    [HttpPost]
    public async Task<IActionResult> Start([FromBody] StartTransactionBody body, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<StartTransactionRequest, StartTransactionResponse>(
            new StartTransactionRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = body.EmployeeId,
                Currency = _options.Currency,
                CustomerId = body.CustomerId
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }

    [HttpPost("{cartId:guid}/items")]
    public async Task<IActionResult> AddItem(Guid cartId, [FromBody] AddItemBody body, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<AddItemRequest, AddItemResponse>(
            new AddItemRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = body.EmployeeId,
                Currency = _options.Currency,
                CartId = cartId,
                Sku = body.Sku,
                Quantity = body.Quantity
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }

    [HttpDelete("{cartId:guid}/items/{lineId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid cartId, Guid lineId, [FromQuery] Guid employeeId, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<RemoveItemRequest, RemoveItemResponse>(
            new RemoveItemRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = employeeId,
                Currency = _options.Currency,
                CartId = cartId,
                LineId = lineId
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }

    [HttpPost("{cartId:guid}/void")]
    public async Task<IActionResult> Void(Guid cartId, [FromQuery] Guid employeeId, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<VoidTransactionRequest, VoidTransactionResponse>(
            new VoidTransactionRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = employeeId,
                Currency = _options.Currency,
                CartId = cartId
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }
}

public sealed record StartTransactionBody(Guid EmployeeId, Guid? CustomerId);
public sealed record AddItemBody(Guid EmployeeId, string Sku, int Quantity = 1);
