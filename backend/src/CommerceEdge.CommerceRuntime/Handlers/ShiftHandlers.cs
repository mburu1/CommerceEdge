using CommerceEdge.Application.Commands;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Handlers;

public sealed class OpenShiftHandler(IShiftService shifts)
    : ICommerceRequestHandler<OpenShiftRequest, OpenShiftResponse>
{
    public async Task<OpenShiftResponse> HandleAsync(OpenShiftRequest request, CancellationToken ct = default)
    {
        var shift = await shifts.OpenAsync(new OpenShiftCommand(
            request.StoreId,
            request.RegisterId,
            request.EmployeeId,
            request.OpeningFloat,
            request.Currency), ct);

        return new OpenShiftResponse { RequestId = request.RequestId, Success = true, Shift = shift };
    }
}

public sealed class CloseShiftHandler(IShiftService shifts)
    : ICommerceRequestHandler<CloseShiftRequest, CloseShiftResponse>
{
    public async Task<CloseShiftResponse> HandleAsync(CloseShiftRequest request, CancellationToken ct = default)
    {
        await shifts.CloseAsync(new CloseShiftCommand(
            request.ShiftId,
            request.ClosingFloat,
            request.Currency), ct);

        var shift = await shifts.GetByIdAsync(new GetShiftByIdQuery(request.ShiftId), ct);
        return new CloseShiftResponse { RequestId = request.RequestId, Success = true, Shift = shift };
    }
}
