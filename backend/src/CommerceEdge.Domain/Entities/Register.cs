using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Exceptions;

namespace CommerceEdge.Domain.Entities;

public sealed class Register : Entity
{
    public Guid StoreId { get; private set; }
    public string RegisterNumber { get; private set; }
    public RegisterStatus Status { get; private set; }

    private Register() { RegisterNumber = default!; }

    internal static Register Create(Guid storeId, string registerNumber)
    {
        if (string.IsNullOrWhiteSpace(registerNumber)) { throw new DomainException("Register number is required."); }
        return new Register { StoreId = storeId, RegisterNumber = registerNumber, Status = RegisterStatus.Closed };
    }

    public void Open() => Status = RegisterStatus.Open;
    public void Close() => Status = RegisterStatus.Closed;
    public void Suspend() => Status = RegisterStatus.Suspended;
}
