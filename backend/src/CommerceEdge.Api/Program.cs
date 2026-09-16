using CommerceEdge.Api.Extensions;
using CommerceEdge.Api.Middleware;
using CommerceEdge.Application.DependencyInjection;
using CommerceEdge.Infrastructure.DependencyInjection;
using CommerceEdge.Observability.AspNetCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseCommerceEdgeSerilog(builder.Configuration, "commerceedge-api");

builder.Services.AddControllers();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddApiHealthChecks();
builder.Services.AddCommerceEdgeObservability(builder.Configuration, "commerceedge-api");

var app = builder.Build();

app.UseCommerceEdgeRequestObservability(app.Configuration);
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapCommerceEdgeMetrics(app.Services.GetRequiredService<ObservabilityOptions>());
app.MapCommerceEdgeHealthChecks();

app.Run();
