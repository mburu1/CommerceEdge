using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace CommerceEdge.Observability.AspNetCore;

public sealed class CorrelationIdMiddleware(
    RequestDelegate next,
    IOptions<ObservabilityOptions> options)
{
    public const string ItemKey = "CommerceEdge.CorrelationId";

    public async Task InvokeAsync(HttpContext context)
    {
        var headerName = options.Value.CorrelationIdHeaderName;
        var incoming = context.Request.Headers[headerName].FirstOrDefault();
        var correlationId = string.IsNullOrWhiteSpace(incoming) || incoming.Length > 128
            ? Guid.NewGuid().ToString("N")
            : incoming;

        context.Items[ItemKey] = correlationId;
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[headerName] = correlationId;
            if (Activity.Current is not null)
            {
                context.Response.Headers["Trace-Id"] = Activity.Current.TraceId.ToHexString();
            }

            return Task.CompletedTask;
        });

        await next(context);
    }

    public static string GetCorrelationId(HttpContext context) =>
        context.Items.TryGetValue(ItemKey, out var value) ? value as string ?? string.Empty : string.Empty;
}
