#!/bin/bash
dotnet tool install --global dotnet-ef
export PATH=$PATH:/root/.dotnet/tools
cd /src
dotnet ef database update --project backend/src/CommerceEdge.Infrastructure --startup-project backend/src/CommerceEdge.Api