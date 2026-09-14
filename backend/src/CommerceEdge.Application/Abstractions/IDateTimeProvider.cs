namespace CommerceEdge.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
