FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
RUN mkdir -p /app/logs && \
    useradd --no-create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app && \
    apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Directory.Build.props", "."]
COPY ["backend/src/CommerceEdge.Api/CommerceEdge.Api.csproj", "backend/src/CommerceEdge.Api/"]
COPY ["backend/src/CommerceEdge.Application/CommerceEdge.Application.csproj", "backend/src/CommerceEdge.Application/"]
COPY ["backend/src/CommerceEdge.Domain/CommerceEdge.Domain.csproj", "backend/src/CommerceEdge.Domain/"]
COPY ["backend/src/CommerceEdge.Infrastructure/CommerceEdge.Infrastructure.csproj", "backend/src/CommerceEdge.Infrastructure/"]
COPY ["backend/src/CommerceEdge.Observability/CommerceEdge.Observability.csproj", "backend/src/CommerceEdge.Observability/"]
COPY ["backend/src/CommerceEdge.Observability.AspNetCore/CommerceEdge.Observability.AspNetCore.csproj", "backend/src/CommerceEdge.Observability.AspNetCore/"]
RUN dotnet restore "backend/src/CommerceEdge.Api/CommerceEdge.Api.csproj"
COPY . .
RUN dotnet publish "backend/src/CommerceEdge.Api/CommerceEdge.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
ENTRYPOINT ["dotnet", "CommerceEdge.Api.dll"]