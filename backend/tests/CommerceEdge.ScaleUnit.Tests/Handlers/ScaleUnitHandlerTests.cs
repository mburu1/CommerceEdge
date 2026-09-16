using CommerceEdge.ScaleUnit.Handlers;
using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.Application.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.ScaleUnit.Tests;

public class OpenShiftHandlerTests
{
    private readonly IShiftService _shiftService = Substitute.For<IShiftService>();
    private readonly OpenShiftHandler _handler;

    public OpenShiftHandlerTests()
    {
        _handler = new OpenShiftHandler(_shiftService);
    }

    [Fact]
    public async Task HandleAsync_ValidRequest_ReturnsSuccess()
    {
        var request = new OpenShiftRequest
        {
            StoreId = Guid.NewGuid(),
            RegisterId = Guid.NewGuid(),
            EmployeeId = Guid.NewGuid(),
            OpeningFloat = 100m,
            Currency = "USD"
        };

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.RequestId.Should().Be(request.RequestId);
    }
}

public class CloseShiftHandlerTests
{
    private readonly IShiftService _shiftService = Substitute.For<IShiftService>();
    private readonly CloseShiftHandler _handler;

    public CloseShiftHandlerTests()
    {
        _handler = new CloseShiftHandler(_shiftService);
    }

    [Fact]
    public async Task HandleAsync_ValidRequest_ReturnsSuccess()
    {
        var request = new CloseShiftRequest
        {
            ShiftId = Guid.NewGuid(),
            ClosingFloat = 500m,
            Currency = "USD"
        };

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
    }
}

public class CheckStockHandlerTests
{
    private readonly IInventoryService _inventoryService = Substitute.For<IInventoryService>();
    private readonly CheckStockHandler _handler;

    public CheckStockHandlerTests()
    {
        _handler = new CheckStockHandler(_inventoryService);
    }

    [Fact]
    public async Task HandleAsync_StockFound_ReturnsInventory()
    {
        var request = new CheckStockRequest { Sku = "SKU1" };
        var stock = new InventoryDto(Guid.NewGuid(), Guid.NewGuid(), null, Guid.NewGuid(), "SKU1", 10, 0, 10, 0, "Available");

        _inventoryService.GetBySkuAsync(Arg.Any<GetInventoryBySkuQuery>(), Arg.Any<CancellationToken>())
            .Returns(stock);

        var result = await _handler.HandleAsync(request, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Inventory.Should().NotBeNull();
        result.Inventory.Sku.Should().Be("SKU1");
    }
}
