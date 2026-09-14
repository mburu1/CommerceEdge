FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["backend/src/CommerceEdge.Api/CommerceEdge.Api.csproj", "backend/src/CommerceEdge.Api/"]
COPY ["backend/src/CommerceEdge.Application/CommerceEdge.Application.csproj", "backend/src/CommerceEdge.Application/"]
COPY ["backend/src/CommerceEdge.Domain/CommerceEdge.Domain.csproj", "backend/src/CommerceEdge.Domain/"]
COPY ["backend/src/CommerceEdge.Infrastructure/CommerceEdge.Infrastructure.csproj", "backend/src/CommerceEdge.Infrastructure/"]
RUN dotnet restore "backend/src/CommerceEdge.Api/CommerceEdge.Api.csproj"
COPY . .
RUN dotnet publish "backend/src/CommerceEdge.Api/CommerceEdge.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CommerceEdge.Api.dll"]
