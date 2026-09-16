using CommerceEdge.Application.DependencyInjection;
using CommerceEdge.CommerceRuntime.Extensions;
using CommerceEdge.Observability.AspNetCore;
using CommerceEdge.ScaleUnit.Extensions;
using CommerceEdge.ScaleUnit.Middleware;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseCommerceEdgeSerilog(builder.Configuration, "commerceedge-scale-unit");

builder.Services.AddControllers();
builder.Services.AddApplication();
builder.Services.AddCommerceRuntime();
builder.Services.AddScaleUnit(builder.Configuration);
builder.Services.AddCommerceEdgeHealthChecks();
builder.Services.AddCommerceEdgeObservability(builder.Configuration, "commerceedge-scale-unit");

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
