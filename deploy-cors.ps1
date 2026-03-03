# Firebase CORS Deployment Script
# Run this in PowerShell as Administrator

Write-Host "🔧 Deploying Firebase CORS Configuration..." -ForegroundColor Yellow

# Check if gsutil is installed
if (-not (Get-Command gsutil -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gsutil not found. Please install Google Cloud SDK first:" -ForegroundColor Red
    Write-Host "📥 Download: https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
    Write-Host "📝 After installation, run: gcloud init" -ForegroundColor Cyan
    exit 1
}

# Deploy CORS configuration
try {
    Write-Host "🚀 Setting CORS rules for Firebase Storage..." -ForegroundColor Green
    gsutil cors set firebase-cors.json gs://aluverse93.appspot.com
    Write-Host "✅ CORS configuration deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy CORS: $_" -ForegroundColor Red
    Write-Host "🔍 Make sure you're authenticated: gcloud auth login" -ForegroundColor Yellow
}

Write-Host "🎉 CORS setup complete! Photo uploads should work now." -ForegroundColor Green
