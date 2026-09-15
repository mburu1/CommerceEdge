using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.ToTable("Orders");
        b.HasKey(o => o.Id);
        b.Property(o => o.OrderNumber).IsRequired().HasMaxLength(50);
        b.HasIndex(o => o.OrderNumber).IsUnique();
        b.Property(o => o.Currency).IsRequired().HasMaxLength(3);
        b.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);

        b.OwnsOne(o => o.Subtotal, m =>
        {
            m.Property(x => x.Amount).HasColumnName("Subtotal").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("SubtotalCurrency").HasMaxLength(3);
        });
        b.OwnsOne(o => o.TaxAmount, m =>
        {
            m.Property(x => x.Amount).HasColumnName("TaxAmount").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("TaxCurrency").HasMaxLength(3);
        });
        b.OwnsOne(o => o.Total, m =>
        {
            m.Property(x => x.Amount).HasColumnName("Total").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("TotalCurrency").HasMaxLength(3);
        });
        b.OwnsOne(o => o.ShippingAddress, m =>
        {
            m.Property(x => x.Line1).HasColumnName("ShipLine1").HasMaxLength(200);
            m.Property(x => x.Line2).HasColumnName("ShipLine2").HasMaxLength(200);
            m.Property(x => x.City).HasColumnName("ShipCity").HasMaxLength(100);
            m.Property(x => x.State).HasColumnName("ShipState").HasMaxLength(100);
            m.Property(x => x.PostalCode).HasColumnName("ShipPostalCode").HasMaxLength(20);
            m.Property(x => x.Country).HasColumnName("ShipCountry").HasMaxLength(100);
        });

        b.HasMany(o => o.Lines).WithOne().HasForeignKey(l => l.OrderId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(o => o.Payments).WithOne().HasForeignKey(p => p.OrderId).OnDelete(DeleteBehavior.Cascade);
        b.Ignore(o => o.DomainEvents);
    }
}

internal sealed class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> b)
    {
        b.ToTable("OrderLines");
        b.HasKey(l => l.Id);
        b.Property(l => l.ProductName).IsRequired().HasMaxLength(200);
        b.Property(l => l.Sku).IsRequired().HasMaxLength(50);
        b.Property(l => l.Quantity);
        b.Property(l => l.Status).HasConversion<string>().HasMaxLength(20);

        b.OwnsOne(l => l.UnitPrice, m =>
        {
            m.Property(x => x.Amount).HasColumnName("UnitPrice").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("Currency").HasMaxLength(3);
        });

        b.Ignore(l => l.LineTotal);
    }
}

internal sealed class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> b)
    {
        b.ToTable("Payments");
        b.HasKey(p => p.Id);
        b.Property(p => p.Method).HasConversion<string>().HasMaxLength(20);
        b.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        b.Property(p => p.CreatedAt);

        b.OwnsOne(p => p.Amount, m =>
        {
            m.Property(x => x.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("Currency").HasMaxLength(3);
        });
    }
}
