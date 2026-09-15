using CommerceEdge.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("Products");
        b.HasKey(p => p.Id);
        b.Property(p => p.Name).IsRequired().HasMaxLength(200);
        b.Property(p => p.Sku).IsRequired().HasMaxLength(50);
        b.HasIndex(p => p.Sku).IsUnique();
        b.Property(p => p.Description).HasMaxLength(2000);
        b.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);

        b.OwnsOne(p => p.BasePrice, m =>
        {
            m.Property(x => x.Amount).HasColumnName("BasePrice").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("BaseCurrency").HasMaxLength(3);
        });

        b.HasMany(p => p.Variants).WithOne().HasForeignKey(v => v.ProductId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(p => p.Categories).WithMany().UsingEntity("ProductCategories");

        b.Ignore(p => p.DomainEvents);
    }
}
