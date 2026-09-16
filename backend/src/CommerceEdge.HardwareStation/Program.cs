using CommerceEdge.CommerceRuntime.Extensions;
using CommerceEdge.HardwareStation.Extensions;
using CommerceEdge.Observability.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseCommerceEdgeSerilog(builder.Configuration, "commerceedge-hardware-station");

builder.Services.AddControllers();
builder.Services.AddCommerceRuntime();
builder.Services.AddHardwareStation();
builder.Services.AddCommerceEdgeHealthChecks();
builder.Services.AddCommerceEdgeObservability(builder.Configuration, "commerceedge-hardware-station");

var app = builder.Build();

app.UseCommerceEdgeRequestObservability(app.Configuration);
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthorization();
app.MapControllers();
app.MapCommerceEdgeMetrics(app.Services.GetRequiredService<ObservabilityOptions>());
app.MapCommerceEdgeHealthChecks();

app.Run();
