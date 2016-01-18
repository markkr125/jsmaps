$nuget = $env:NuGet

#parse the version number out of package.json
$version = ((Get-Content $env:SourcesPath\package.json) -join "`n" | ConvertFrom-Json).version

#create packages
& $nuget pack "nuget\jsmaps.nuspec" -Verbosity detailed -NonInteractive -NoPackageAnalysis -BasePath $env:SourcesPath -Version $version