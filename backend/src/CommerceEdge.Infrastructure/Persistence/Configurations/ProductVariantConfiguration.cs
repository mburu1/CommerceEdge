using CommerceEdge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> b)
    {
        b.ToTable("ProductVariants");
        b.HasKey(v => v.Id);
        b.Property(v => v.Sku).IsRequired().HasMaxLength(50);
        b.HasIndex(v => v.Sku).IsUnique();
        b.Property(v => v.Name).IsRequired().HasMaxLength(200);

        b.OwnsOne(v => v.Price, m =>
        {
            m.Property(x => x.Amount).HasColumnName("Price").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("Currency").HasMaxLength(3);
        });
    }
}
