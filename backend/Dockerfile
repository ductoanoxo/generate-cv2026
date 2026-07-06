FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /app

# Copy csproj and restore
COPY ["GenerateCV.API.csproj", "./"]
RUN dotnet restore

# Copy remaining files
COPY . .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_WATCH_RESTART_ON_RUDE_EDIT=true

ENTRYPOINT ["dotnet", "watch", "run", "--no-launch-profile"]
