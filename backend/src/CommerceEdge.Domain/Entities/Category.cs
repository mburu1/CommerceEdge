using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;

namespace CommerceEdge.Domain.Entities;

public sealed class Category : Entity
{
    public string Name { get; private set; }
    public Guid? ParentCategoryId { get; private set; }

    private Category() { Name = default!; }

    public static Category Create(string name, Guid? parentCategoryId = null)
    {
        if (string.IsNullOrWhiteSpace(name)) { throw new DomainException("Category name is required."); }
        return new Category { Name = name, ParentCategoryId = parentCategoryId };
    }
}
