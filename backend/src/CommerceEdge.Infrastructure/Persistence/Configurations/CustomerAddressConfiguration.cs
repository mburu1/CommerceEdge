using CommerceEdge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> b)
    {
        b.ToTable("CustomerAddresses");
        b.HasKey(a => a.Id);
        b.Property(a => a.IsDefault);

        b.OwnsOne(a => a.Address, m =>
        {
            m.Property(x => x.Line1).HasColumnName("Line1").IsRequired().HasMaxLength(200);
            m.Property(x => x.Line2).HasColumnName("Line2").HasMaxLength(200);
            m.Property(x => x.City).HasColumnName("City").IsRequired().HasMaxLength(100);
            m.Property(x => x.State).HasColumnName("State").HasMaxLength(100);
            m.Property(x => x.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
            m.Property(x => x.Country).HasColumnName("Country").IsRequired().HasMaxLength(100);
        });
    }
}

internal sealed class LoyaltyAccountConfiguration : IEntityTypeConfiguration<LoyaltyAccount>
{
    public void Configure(EntityTypeBuilder<LoyaltyAccount> b)
    {
        b.ToTable("LoyaltyAccounts");
        b.HasKey(l => l.Id);
        b.Property(l => l.Points);
        b.Property(l => l.EnrolledAt);
    }
}
