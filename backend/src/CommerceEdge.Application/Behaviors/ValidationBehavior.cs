using FluentValidation;

namespace CommerceEdge.Application.Behaviors;

public sealed class ValidationBehavior<TRequest>(IEnumerable<IValidator<TRequest>> validators)
{
    public async Task ValidateAsync(TRequest request, CancellationToken ct = default)
    {
        if (!validators.Any())
        {
            return;
        }

        var context = new ValidationContext<TRequest>(request);
        var failures = (await Task.WhenAll(validators.Select(v => v.ValidateAsync(context, ct))))
            .SelectMany(r => r.Errors)
            .Where(f => f is not null)
            .ToList();

        if (failures.Count > 0)
        {
            throw new ValidationException(failures);
        }
    }
}
