using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.ScaleUnit.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CommerceEdge.ScaleUnit.Controllers;

[ApiController]
[Route("scaleunit/shifts")]
[Authorize]
public sealed class ShiftController(ICommerceRuntime runtime, IOptions<ScaleUnitOptions> options) : ControllerBase
{
    private readonly ScaleUnitOptions _options = options.Value;

    [HttpPost("open")]
    public async Task<IActionResult> Open([FromBody] OpenShiftBody body, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<OpenShiftRequest, OpenShiftResponse>(
            new OpenShiftRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = body.EmployeeId,
                Currency = _options.Currency,
                OpeningFloat = body.OpeningFloat
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }

    [HttpPost("{shiftId:guid}/close")]
    public async Task<IActionResult> Close(Guid shiftId, [FromBody] CloseShiftBody body, CancellationToken ct)
    {
        var response = await runtime.ExecuteAsync<CloseShiftRequest, CloseShiftResponse>(
            new CloseShiftRequest
            {
                StoreId = _options.StoreId,
                RegisterId = _options.RegisterId,
                EmployeeId = body.EmployeeId,
                Currency = _options.Currency,
                ShiftId = shiftId,
                ClosingFloat = body.ClosingFloat
            }, ct);

        return response.Success ? Ok(response) : UnprocessableEntity(response);
    }
}

public sealed record OpenShiftBody(Guid EmployeeId, decimal OpeningFloat);
public sealed record CloseShiftBody(Guid EmployeeId, decimal ClosingFloat);
