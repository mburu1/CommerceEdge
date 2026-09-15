using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.ScaleUnit.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CommerceEdge.ScaleUnit.Controllers;

[ApiController]
[Route("scaleunit/customers")]
[Authorize]
public sealed class CustomerController(ICommerceRuntime runtime, IOptions<ScaleUnitOptions> options) : ControllerBase
{
    private readonly ScaleUnitOptions _options = options.Value;

    [HttpGet("lookup")]
    public async Task<IActionResult> Lookup([FromQuery] string email, [FromQuery] Guid employeeId, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<LookupCustomerRequest, LookupCustomerResponse>(
            new LookupCustomerRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = employeeId,
                Currency = _options.Currency,
                Email = email
            }, ct);

        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("{customerId:guid}/attach/{cartId:guid}")]
    public async Task<IActionResult> Attach(Guid customerId, Guid cartId, [FromQuery] Guid employeeId, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<AttachCustomerRequest, AttachCustomerResponse>(
            new AttachCustomerRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = employeeId,
                Currency = _options.Currency,
                CustomerId = customerId,
                CartId = cartId
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }
}
