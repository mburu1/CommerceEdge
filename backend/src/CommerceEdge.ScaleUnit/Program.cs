using CommerceEdge.Application.DependencyInjection;
using CommerceEdge.CommerceRuntime.Extensions;
using CommerceEdge.ScaleUnit.Extensions;
using CommerceEdge.ScaleUnit.Middleware;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddApplication();
builder.Services.AddCommerceRuntime();
builder.Services.AddScaleUnit(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
