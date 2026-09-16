using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace CommerceEdge.Observability;

public static class CommerceEdgeTelemetry
{
    public const string ActivitySourceName = "CommerceEdge";
    public const string MeterName = "CommerceEdge";

    public static readonly ActivitySource ActivitySource = new(ActivitySourceName, "1.0.0");
    public static readonly Meter Meter = new(MeterName, "1.0.0");

    public static readonly Histogram<double> OperationDuration = Meter.CreateHistogram<double>(
        "commerceedge.operation.duration",
        "s",
        "Duration of a CommerceEdge operation.");
    public static readonly Counter<long> OperationCount = Meter.CreateCounter<long>(
        "commerceedge.operation.count",
        description: "Number of CommerceEdge operations completed.");
    public static readonly Counter<long> OperationFailureCount = Meter.CreateCounter<long>(
        "commerceedge.operation.failure.count",
        description: "Number of CommerceEdge operations that failed.");
    public static readonly Counter<long> CacheOperationCount = Meter.CreateCounter<long>(
        "commerceedge.cache.operation.count",
        description: "Number of cache operations completed.");
    public static readonly Counter<long> MessagingPublishedCount = Meter.CreateCounter<long>(
        "commerceedge.messaging.published.count",
        description: "Number of messages published by CommerceEdge.");
    public static readonly Histogram<double> PaymentDuration = Meter.CreateHistogram<double>(
        "commerceedge.payment.duration",
        "s",
        "Duration of payment processing.");

    public static MeasuredOperation Measure(
        string operation,
        params (string Key, object? Value)[] tags)
    {
        var activityTags = tags.Length == 0
            ? null
            : new ActivityTagsCollection(tags.Select(tag =>
                new KeyValuePair<string, object?>(tag.Key, tag.Value)));
        var parentContext = Activity.Current?.Context ?? default(ActivityContext);
        var activity = ActivitySource.StartActivity(
            $"CommerceEdge.{operation}",
            ActivityKind.Internal,
            parentContext,
            activityTags,
            null,
            default);

        return new MeasuredOperation(activity, operation, tags);
    }
}

public sealed class MeasuredOperation : IDisposable
{
    private readonly Activity? _activity;
    private readonly string _operation;
    private readonly (string Key, object? Value)[] _tags;
    private readonly Stopwatch _stopwatch = Stopwatch.StartNew();
    private bool _success = true;
    private bool _disposed;

    internal MeasuredOperation(
        Activity? activity,
        string operation,
        (string Key, object? Value)[] tags)
    {
        _activity = activity;
        _operation = operation;
        _tags = tags;
    }

    public double ElapsedSeconds => _stopwatch.Elapsed.TotalSeconds;

    public long ElapsedMilliseconds => _stopwatch.ElapsedMilliseconds;

    public void MarkFailed()
    {
        _success = false;
    }

    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;
        _stopwatch.Stop();

        var tags = new TagList
        {
            { "operation", _operation },
            { "success", _success ? "true" : "false" }
        };

        foreach (var tag in _tags)
        {
            tags.Add(tag.Key, tag.Value);
        }

        CommerceEdgeTelemetry.OperationDuration.Record(_stopwatch.Elapsed.TotalSeconds, tags);
        CommerceEdgeTelemetry.OperationCount.Add(1, tags);

        if (!_success)
        {
            CommerceEdgeTelemetry.OperationFailureCount.Add(1, tags);
        }

        _activity?.SetStatus(_success ? ActivityStatusCode.Ok : ActivityStatusCode.Error);
        _activity?.Dispose();
    }
}
