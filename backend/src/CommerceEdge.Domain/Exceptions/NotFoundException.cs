namespace CommerceEdge.Domain.Exceptions;

public class NotFoundException(string entityName, object key)
    : DomainException($"{entityName} with key '{key}' was not found.");
