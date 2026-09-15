using CommerceEdge.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> b)
    {
        b.ToTable("Customers");
        b.HasKey(c => c.Id);
        b.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
        b.Property(c => c.LastName).IsRequired().HasMaxLength(100);
        b.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);

        b.OwnsOne(c => c.Email, m =>
        {
            m.Property(x => x.Value).HasColumnName("Email").IsRequired().HasMaxLength(256);
            m.HasIndex(x => x.Value).IsUnique();
        });

        b.OwnsOne(c => c.Phone, m =>
        {
            m.Property(x => x.Value).HasColumnName("Phone").HasMaxLength(20);
        });

        b.HasMany(c => c.Addresses).WithOne().HasForeignKey(a => a.CustomerId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(c => c.LoyaltyAccount).WithOne().HasForeignKey<Domain.Entities.LoyaltyAccount>(l => l.CustomerId).OnDelete(DeleteBehavior.Cascade);

        b.Ignore(c => c.DomainEvents);
    }
}
