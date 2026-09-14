using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace CommerceEdge.Application.Behaviors;

public sealed class LoggingBehavior(ILogger<LoggingBehavior> logger)
{
    public async Task<T> ExecuteAsync<T>(string operationName, Func<Task<T>> next)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var result = await next();
            logger.LogInformation("{Operation} completed in {Elapsed}ms", operationName, sw.ElapsedMilliseconds);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "{Operation} failed after {Elapsed}ms", operationName, sw.ElapsedMilliseconds);
            throw;
        }
    }

    public async Task ExecuteAsync(string operationName, Func<Task> next)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await next();
            logger.LogInformation("{Operation} completed in {Elapsed}ms", operationName, sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "{Operation} failed after {Elapsed}ms", operationName, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
