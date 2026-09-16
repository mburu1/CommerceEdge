using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Observability.AspNetCore;
using FluentValidation;
using System.Diagnostics;
using System.Text.Json;

namespace CommerceEdge.ScaleUnit.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex)
        {
            await HandleAsync(ctx, ex, logger);
        }
    }

    private static async Task HandleAsync(HttpContext ctx, Exception ex, ILogger logger)
    {
        var (status, title, errors) = ex switch
        {
            NotFoundException nfe => (StatusCodes.Status404NotFound, nfe.Message, (object?)null),
            DomainException de => (StatusCodes.Status422UnprocessableEntity, de.Message, (object?)null),
            ValidationException ve => (StatusCodes.Status400BadRequest, "Validation failed.",
                (object)ve.Errors.GroupBy(e => e.PropertyName).ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.", (object?)null)
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(ex, "Unhandled exception");
        }

        var correlationId = CorrelationIdMiddleware.GetCorrelationId(ctx);
        if (!string.IsNullOrEmpty(correlationId))
        {
            ctx.Response.Headers["X-Correlation-ID"] = correlationId;
        }

        var traceId = Activity.Current?.TraceId.ToHexString();
        if (!string.IsNullOrEmpty(traceId))
        {
            ctx.Response.Headers["Trace-Id"] = traceId;
        }

        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/problem+json";

        var problem = new { title, status, errors, traceId };
        await ctx.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
