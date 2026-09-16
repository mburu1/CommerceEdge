using CommerceEdge.Application.Abstractions;
using CommerceEdge.Application.Commands;
using CommerceEdge.Application.DTOs;
using CommerceEdge.Application.Queries;
using CommerceEdge.Application.Services;
using CommerceEdge.Domain.Aggregates;
using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.Repositories;
using CommerceEdge.Domain.ValueObjects;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.Application.Tests;

public class CartServiceTests
{
    private readonly ICartRepository _cartRepo = Substitute.For<ICartRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDomainEventDispatcher _dispatcher = Substitute.For<IDomainEventDispatcher>();
    private readonly CartService _service;

    public CartServiceTests()
    {
        _service = new CartService(_cartRepo, _uow, _dispatcher);
    }

    [Fact]
    public async Task CreateAsync_CreatesCartAndReturnsDto()
    {
        var cmd = new CreateCartCommand(Guid.NewGuid(), "USD", null);
        _cartRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Cart?)null);
        _cartRepo.AddAsync(Arg.Any<Cart>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.StoreId.Should().Be(cmd.StoreId);
    }

    [Fact]
    public async Task AddLineAsync_AddsLineToCart()
    {
        var cmd = new AddCartLineCommand(Guid.NewGuid(), Guid.NewGuid(), null, "Widget", "W1", 10m, "USD", 2);
        var cart = Cart.Create(cmd.CartId, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 2);

        _cartRepo.GetByIdAsync(cmd.CartId, Arg.Any<CancellationToken>()).Returns(cart);
        _cartRepo.UpdateAsync(Arg.Any<Cart>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.AddLineAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Lines.Should().HaveCount(1);
    }

    [Fact]
    public async Task AddLineAsync_CartNotFound_ThrowsNotFoundException()
    {
        var cmd = new AddCartLineCommand(Guid.NewGuid(), Guid.NewGuid(), null, "Widget", "W1", 10m, "USD", 2);
        _cartRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Cart?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.AddLineAsync(cmd, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task RemoveLineAsync_RemovesLineSuccessfully()
    {
        var cmd = new RemoveCartLineCommand(Guid.NewGuid(), Guid.NewGuid());
        var cart = Cart.Create(cmd.CartId, "USD");
        var line = cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 1);
        _cartRepo.GetByIdAsync(Arg.Is(cmd.CartId), Arg.Any<CancellationToken>()).Returns(cart);
        _cartRepo.UpdateAsync(Arg.Any<Cart>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        await _service.RemoveLineAsync(new RemoveCartLineCommand(cmd.CartId, line.Id), TestContext.Current.CancellationToken);

        cart.Lines.Should().BeEmpty();
    }

    [Fact]
    public async Task CheckoutAsync_CheckoutsCartSuccessfully()
    {
        var cmd = new CheckoutCartCommand(Guid.NewGuid());
        var cart = Cart.Create(cmd.CartId, "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 2);

        _cartRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns(cart);
        _cartRepo.UpdateAsync(Arg.Any<Cart>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.CheckoutAsync(cmd, TestContext.Current.CancellationToken);

        result.Status.Should().Be("CheckedOut");
    }

    [Fact]
    public async Task AbandonAsync_AbandonsCartSuccessfully()
    {
        var cmd = new AbandonCartCommand(Guid.NewGuid());
        var cart = Cart.Create(cmd.CartId, "USD");

        _cartRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns(cart);
        _cartRepo.UpdateAsync(Arg.Any<Cart>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        await _service.AbandonAsync(cmd, TestContext.Current.CancellationToken);

        cart.Status.Should().Be(CartStatus.Abandoned);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsCartDto()
    {
        var cart = Cart.Create(Guid.NewGuid(), "USD");
        cart.AddLine(Guid.NewGuid(), null, "Widget", "W1", new Money(10, "USD"), 2);

        _cartRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns(cart);

        var result = await _service.GetByIdAsync(new GetCartByIdQuery(cart.Id), TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Lines.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetByIdAsync_CartNotFound_ReturnsNull()
    {
        _cartRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Cart?)null);

        var result = await _service.GetByIdAsync(new GetCartByIdQuery(Guid.NewGuid()), TestContext.Current.CancellationToken);

        result.Should().BeNull();
    }
}

public class OrderServiceTests
{
    private readonly IOrderRepository _orderRepo = Substitute.For<IOrderRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDomainEventDispatcher _dispatcher = Substitute.For<IDomainEventDispatcher>();
    private readonly OrderService _service = new(Substitute.For<IOrderRepository>(), Substitute.For<IUnitOfWork>(), Substitute.For<IDomainEventDispatcher>());

    [Fact]
    public async Task CreateAsync_CreatesOrder()
    {
        var cmd = new CreateOrderCommand("ORD-001", Guid.NewGuid(), "USD", null, Guid.NewGuid());
        _orderRepo.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Order?)null);
        _orderRepo.AddAsync(Arg.Any<Order>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.StoreId.Should().Be(cmd.StoreId);
    }
}

public class ProductServiceTests
{
    private readonly IProductRepository _productRepo = Substitute.For<IProductRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDomainEventDispatcher _dispatcher = Substitute.For<IDomainEventDispatcher>();
    private readonly ProductService _service = new(Substitute.For<IProductRepository>(), Substitute.For<IUnitOfWork>(), Substitute.For<IDomainEventDispatcher>());

    [Fact]
    public async Task CreateAsync_CreatesProduct()
    {
        var cmd = new CreateProductCommand("Test Product", "SKU1", 9.99m, "USD", "Description");
        _productRepo.GetBySkuAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((Product?)null);
        _productRepo.AddAsync(Arg.Any<Product>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Sku.Should().Be("SKU1");
    }
}

public class CustomerServiceTests
{
    private readonly ICustomerRepository _customerRepo = Substitute.For<ICustomerRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDomainEventDispatcher _dispatcher = Substitute.For<IDomainEventDispatcher>();
    private readonly CustomerService _service;

    public CustomerServiceTests()
    {
        _service = new(_customerRepo, Substitute.For<IUnitOfWork>(), Substitute.For<IDomainEventDispatcher>());
    }

    [Fact]
    public async Task CreateAsync_CreatesCustomer()
    {
        var cmd = new CreateCustomerCommand("John", "Doe", "john@example.com", null);
        _customerRepo.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((Customer?)null);
        _customerRepo.AddAsync(Arg.Any<Customer>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.FirstName.Should().Be("John");
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmail_ThrowsDomainException()
    {
        var cmd = new CreateCustomerCommand("John", "Doe", "john@example.com", null);
        _customerRepo.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<Customer?>(Customer.Create("John", "Doe", new Email("john@example.com"), null)));

        await Assert.ThrowsAsync<DomainException>(() => _service.CreateAsync(cmd, TestContext.Current.CancellationToken));
    }
}

public class InventoryServiceTests
{
    private readonly IInventoryRepository _inventoryRepo = Substitute.For<IInventoryRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDomainEventDispatcher _dispatcher = Substitute.For<IDomainEventDispatcher>();
    private readonly InventoryService _service;

    public InventoryServiceTests()
    {
        _service = new(_inventoryRepo, _uow, _dispatcher);
    }

    [Fact]
    public async Task CreateAsync_CreatesInventoryItem()
    {
        var cmd = new CreateInventoryItemCommand(Guid.NewGuid(), Guid.NewGuid(), "SKU1", null, 10);
        _inventoryRepo.AddAsync(Arg.Any<InventoryItem>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        var result = await _service.CreateAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Sku.Should().Be("SKU1");
    }
}

public class ShiftServiceTests
{
    private readonly IShiftRepository _shiftRepo = Substitute.For<IShiftRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDomainEventDispatcher _dispatcher = Substitute.For<IDomainEventDispatcher>();
    private readonly ShiftService _service = new(Substitute.For<IShiftRepository>(), Substitute.For<IUnitOfWork>(), Substitute.For<IDomainEventDispatcher>());

    [Fact]
    public async Task OpenAsync_OpensShift()
    {
        var cmd = new OpenShiftCommand(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), 100m, "USD");
        _shiftRepo.AddAsync(Arg.Any<Shift>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.OpenAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.StoreId.Should().Be(cmd.StoreId);
    }
}

public class StoreServiceTests
{
    private readonly IStoreRepository _storeRepo = Substitute.For<IStoreRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly IDomainEventDispatcher _dispatcher = Substitute.For<IDomainEventDispatcher>();
    private readonly StoreService _service = new(Substitute.For<IStoreRepository>(), Substitute.For<IUnitOfWork>(), Substitute.For<IDomainEventDispatcher>());

    [Fact]
    public async Task CreateAsync_CreatesStore()
    {
        var cmd = new CreateStoreCommand("Test Store", "S001", ChannelType.Store, "1 Main", null, "City", "State", "12345", "Country", "USD", "America/New_York");
        _storeRepo.AddAsync(Arg.Any<Store>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);
        _uow.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);
        _dispatcher.DispatchAsync(Arg.Any<IEnumerable<IDomainEvent>>(), Arg.Any<CancellationToken>()).Returns(Task.CompletedTask);

        var result = await _service.CreateAsync(cmd, TestContext.Current.CancellationToken);

        result.Should().NotBeNull();
        result.Name.Should().Be("Test Store");
    }
}
