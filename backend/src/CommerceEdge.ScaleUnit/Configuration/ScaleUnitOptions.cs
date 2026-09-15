namespace CommerceEdge.ScaleUnit.Configuration;

public sealed class ScaleUnitOptions
{
    public const string Section = "ScaleUnit";

    public Guid StoreId { get; init; }
    public Guid RegisterId { get; init; }
    public string Currency { get; init; } = "USD";
    public string TimeZone { get; init; } = "UTC";
}

public sealed class JwtOptions
{
    public const string Section = "Jwt";

    public string Issuer { get; init; } = default!;
    public string Audience { get; init; } = default!;
    public string SecretKey { get; init; } = default!;
}
