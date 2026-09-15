using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class StoreConfiguration : IEntityTypeConfiguration<Store>
{
    public void Configure(EntityTypeBuilder<Store> b)
    {
        b.ToTable("Stores");
        b.HasKey(s => s.Id);
        b.Property(s => s.Name).IsRequired().HasMaxLength(200);
        b.Property(s => s.StoreNumber).IsRequired().HasMaxLength(50);
        b.HasIndex(s => s.StoreNumber).IsUnique();
        b.Property(s => s.ChannelType).HasConversion<string>().HasMaxLength(20);
        b.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        b.Property(s => s.Currency).IsRequired().HasMaxLength(3);
        b.Property(s => s.TimeZone).IsRequired().HasMaxLength(100);

        b.OwnsOne(s => s.Address, m =>
        {
            m.Property(x => x.Line1).HasColumnName("Line1").IsRequired().HasMaxLength(200);
            m.Property(x => x.Line2).HasColumnName("Line2").HasMaxLength(200);
            m.Property(x => x.City).HasColumnName("City").IsRequired().HasMaxLength(100);
            m.Property(x => x.State).HasColumnName("State").HasMaxLength(100);
            m.Property(x => x.PostalCode).HasColumnName("PostalCode").HasMaxLength(20);
            m.Property(x => x.Country).HasColumnName("Country").IsRequired().HasMaxLength(100);
        });

        b.HasMany(s => s.Registers).WithOne().HasForeignKey(r => r.StoreId).OnDelete(DeleteBehavior.Cascade);
        b.Ignore(s => s.DomainEvents);
    }
}

internal sealed class RegisterConfiguration : IEntityTypeConfiguration<Register>
{
    public void Configure(EntityTypeBuilder<Register> b)
    {
        b.ToTable("Registers");
        b.HasKey(r => r.Id);
        b.Property(r => r.RegisterNumber).IsRequired().HasMaxLength(50);
        b.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);
    }
}
