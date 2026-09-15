using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CommerceEdge.Infrastructure.Persistence.Configurations;

internal sealed class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> b)
    {
        b.ToTable("Shifts");
        b.HasKey(s => s.Id);
        b.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
        b.Property(s => s.OpenedAt);
        b.Property(s => s.ClosedAt);

        b.OwnsOne(s => s.OpeningFloat, m =>
        {
            m.Property(x => x.Amount).HasColumnName("OpeningFloat").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("Currency").HasMaxLength(3);
        });
        b.OwnsOne(s => s.ClosingFloat, m =>
        {
            m.Property(x => x.Amount).HasColumnName("ClosingFloat").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("ClosingCurrency").HasMaxLength(3);
        });

        b.HasMany(s => s.Transactions).WithOne().HasForeignKey(t => t.ShiftId).OnDelete(DeleteBehavior.Cascade);
        b.Ignore(s => s.DomainEvents);
    }
}

internal sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> b)
    {
        b.ToTable("Transactions");
        b.HasKey(t => t.Id);
        b.Property(t => t.Type).HasConversion<string>().HasMaxLength(20);
        b.Property(t => t.CreatedAt);

        b.OwnsOne(t => t.Amount, m =>
        {
            m.Property(x => x.Amount).HasColumnName("Amount").HasPrecision(18, 4);
            m.Property(x => x.Currency).HasColumnName("Currency").HasMaxLength(3);
        });
    }
}
