using CommerceEdge.CommerceRuntime.Extensions;
using CommerceEdge.HardwareStation.Extensions;

var builder = WebApplication.CreateBuilder(args);

    builder.Services.AddControllers();
    builder.Services.AddCommerceRuntime();
    builder.Services.AddHardwareStation();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
