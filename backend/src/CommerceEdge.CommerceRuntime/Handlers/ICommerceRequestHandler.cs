using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Handlers;

public interface ICommerceRequestHandler<TRequest, TResponse>
    where TRequest : CommerceRequest
    where TResponse : CommerceResponse
{
    Task<TResponse> HandleAsync(TRequest request, CancellationToken ct = default);
}
