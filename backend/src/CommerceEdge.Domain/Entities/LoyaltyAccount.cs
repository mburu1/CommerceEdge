using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;

namespace CommerceEdge.Domain.Entities;

public sealed class LoyaltyAccount : Entity
{
    public Guid CustomerId { get; private set; }
    public int Points { get; private set; }
    public DateTime EnrolledAt { get; private set; }

    private LoyaltyAccount() { }

    internal static LoyaltyAccount Create(Guid customerId)
        => new() { CustomerId = customerId, Points = 0, EnrolledAt = DateTime.UtcNow };

    public void EarnPoints(int points)
    {
        if (points <= 0) { throw new DomainException("Points must be positive."); }
        Points += points;
    }

    public void RedeemPoints(int points)
    {
        if (points > Points) { throw new DomainException("Insufficient loyalty points."); }
        Points -= points;
    }
}
