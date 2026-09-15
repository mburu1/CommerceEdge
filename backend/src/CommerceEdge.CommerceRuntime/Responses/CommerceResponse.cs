namespace CommerceEdge.CommerceRuntime.Responses;

public abstract record CommerceResponse
{
    public Guid RequestId { get; init; }
    public bool Success { get; init; }
    public string? ErrorMessage { get; init; }

    public static TResponse Fail<TResponse>(Guid requestId, string error)
        where TResponse : CommerceResponse, new()
        => new() { RequestId = requestId, Success = false, ErrorMessage = error };
}
