using CommerceEdge.ScaleUnit.Configuration;
using Microsoft.Extensions.Options;

namespace CommerceEdge.ScaleUnit.Services;

public sealed class OrderNumberService(IOptions<ScaleUnitOptions> options) : IOrderNumberService
{
    private readonly ScaleUnitOptions _options = options.Value;

    // Format: ORD-{StoreId[..4]}-{yyyyMMdd}-{random 6}
    public string Generate()
    {
        var storePrefix = _options.StoreId.ToString("N")[..4].ToUpperInvariant();
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = Random.Shared.Next(100_000, 999_999);
        return $"ORD-{storePrefix}-{datePart}-{random}";
    }
}
