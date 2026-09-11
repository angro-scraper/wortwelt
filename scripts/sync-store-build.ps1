$ErrorActionPreference = 'Stop'
$env:VITE_COMMERCE_ENABLED = 'true'

npm run cap:sync
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
