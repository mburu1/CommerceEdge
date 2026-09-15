using CommerceEdge.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class InventoryItemConfiguration : IEntityTypeConfiguration<InventoryItem>
{
    public void Configure(EntityTypeBuilder<InventoryItem> b)
    {
        b.ToTable("InventoryItems");
        b.HasKey(i => i.Id);
        b.Property(i => i.Sku).IsRequired().HasMaxLength(50);
        b.HasIndex(i => new { i.Sku, i.StoreId }).IsUnique();
        b.Property(i => i.QuantityOnHand);
        b.Property(i => i.QuantityReserved);
        b.Property(i => i.ReorderPoint);
        b.Property(i => i.Status).HasConversion<string>().HasMaxLength(20);
        b.Ignore(i => i.QuantityAvailable);
        b.Ignore(i => i.DomainEvents);
    }
}
