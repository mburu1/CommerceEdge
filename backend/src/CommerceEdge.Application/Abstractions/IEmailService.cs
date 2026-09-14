namespace CommerceEdge.Application.Abstractions;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string body, CancellationToken ct = default);
}
