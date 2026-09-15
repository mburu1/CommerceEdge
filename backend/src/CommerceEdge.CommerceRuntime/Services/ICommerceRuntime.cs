using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;

namespace CommerceEdge.CommerceRuntime.Services;

public interface ICommerceRuntime
{
    Task<TResponse> ExecuteAsync<TRequest, TResponse>(TRequest request, CancellationToken ct = default)
        where TRequest : CommerceRequest
        where TResponse : CommerceResponse, new();
}
