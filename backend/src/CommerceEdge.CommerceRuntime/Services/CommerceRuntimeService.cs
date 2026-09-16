using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.Observability;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace CommerceEdge.CommerceRuntime.Services;

public sealed class CommerceRuntimeService(IServiceProvider services, ILogger<CommerceRuntimeService> logger)
    : ICommerceRuntime
{
    public async Task<TResponse> ExecuteAsync<TRequest, TResponse>(TRequest request, CancellationToken ct = default)
        where TRequest : CommerceRequest
        where TResponse : CommerceResponse, new()
    {
        using var operation = CommerceEdgeTelemetry.Measure(
            "commerce_runtime.execute",
            ("request.type", typeof(TRequest).Name));
        var handler = services.GetService<ICommerceRequestHandler<TRequest, TResponse>>();
        if (handler is null)
        {
            operation.MarkFailed();
            logger.LogError("No handler registered for {RequestType}", typeof(TRequest).Name);
            return CommerceResponse.Fail<TResponse>(request.RequestId,
                $"No handler registered for '{typeof(TRequest).Name}'.");
        }

        try
        {
            logger.LogInformation("Executing {RequestType} [{RequestId}]", typeof(TRequest).Name, request.RequestId);
            var response = await handler.HandleAsync(request, ct);

            if (!response.Success)
            {
                operation.MarkFailed();
                logger.LogWarning("{RequestType} [{RequestId}] failed: {Error}",
                    typeof(TRequest).Name, request.RequestId, response.ErrorMessage);
            }

            return response;
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            logger.LogError(ex, "{RequestType} [{RequestId}] threw an unhandled exception",
                typeof(TRequest).Name, request.RequestId);

            return CommerceResponse.Fail<TResponse>(request.RequestId, "An unexpected error occurred.");
        }
    }
}
