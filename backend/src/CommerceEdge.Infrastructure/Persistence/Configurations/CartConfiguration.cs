using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> b)
    {
        b.ToTable("Carts");
        b.HasKey(c => c.Id);
        b.Property(c => c.Currency).IsRequired().HasMaxLength(3);
        b.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
        b.HasMany(c => c.Lines).WithOne().HasForeignKey(l => l.CartId).OnDelete(DeleteBehavior.Cascade);
        b.Ignore(c => c.Subtotal);
        b.Ignore(c => c.DomainEvents);
    }
}

internal sealed class CartLineConfiguration : IEntityTypeConfiguration<CartLine>
{
    public void Configure(EntityTypeBuilder<CartLine> b)
    {
        b.ToTable("CartLines");
        b.HasKey(l => l.Id);
        b.Property(l => l.ProductName).IsRequired().HasMaxLength(200);
        b.Property(l => l.Sku).IsRequired().HasMaxLength(50);
        b.Property(l => l.Quantity);

        b.OwnsOne(l => l.UnitPrice, m =>
        {
            m.Property(x => x.Amount).HasColumnName("UnitPrice").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        b.Ignore(l => l.LineTotal);
    }
}
