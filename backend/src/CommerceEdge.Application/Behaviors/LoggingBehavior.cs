using CommerceEdge.Observability;
using Microsoft.Extensions.Logging;

namespace CommerceEdge.Application.Behaviors;

public sealed class LoggingBehavior(ILogger<LoggingBehavior> logger)
{
    public async Task<T> ExecuteAsync<T>(string operationName, Func<Task<T>> next)
    {
        using var operation = CommerceEdgeTelemetry.Measure(operationName);

        try
        {
            var result = await next();
            logger.LogInformation("{Operation} completed in {Elapsed}ms", operationName, operation.ElapsedMilliseconds);
            return result;
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            logger.LogError(ex, "{Operation} failed after {Elapsed}ms", operationName, operation.ElapsedMilliseconds);
            throw;
        }
    }

    public async Task ExecuteAsync(string operationName, Func<Task> next)
    {
        using var operation = CommerceEdgeTelemetry.Measure(operationName);

        try
        {
            await next();
            logger.LogInformation("{Operation} completed in {Elapsed}ms", operationName, operation.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            operation.MarkFailed();
            logger.LogError(ex, "{Operation} failed after {Elapsed}ms", operationName, operation.ElapsedMilliseconds);
            throw;
        }
    }
}
