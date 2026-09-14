using CommerceEdge.Application.Commands;
using FluentValidation;

namespace CommerceEdge.Application.Validators;

public class CreateCartCommandValidator : AbstractValidator<CreateCartCommand>
{
    public CreateCartCommandValidator()
    {
        RuleFor(x => x.StoreId).NotEmpty();
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}

public class AddCartLineCommandValidator : AbstractValidator<AddCartLineCommand>
{
    public AddCartLineCommandValidator()
    {
        RuleFor(x => x.CartId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
        RuleFor(x => x.UnitPrice).GreaterThan(0);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}
