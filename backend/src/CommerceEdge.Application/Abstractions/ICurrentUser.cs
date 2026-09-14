namespace CommerceEdge.Application.Abstractions;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Email { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsInRole(string role);
}
