# Test complete OTP login flow

Write-Host "🔄 Testing OTP Login Flow..." -ForegroundColor Cyan

# Step 1: Request OTP
Write-Host "`n1️⃣ Requesting OTP for phone: +10000000000"
$otpResp = Invoke-RestMethod -Uri 'http://localhost:3000/graphql' -Method Post -Body '{"query":"mutation { requestOtp(input: { phone: \"+10000000000\" }) { success message expiresIn otp } }"}' -ContentType 'application/json'

if ($otpResp.data.requestOtp.success) {
  Write-Host "   ✅ OTP Request Success" -ForegroundColor Green
  $otp = $otpResp.data.requestOtp.otp
  Write-Host "   OTP: $otp" -ForegroundColor Yellow
  Write-Host "   Expires: $($otpResp.data.requestOtp.expiresIn) seconds" -ForegroundColor Yellow
} else {
  Write-Host "   ❌ OTP Request Failed: $($otpResp.data.requestOtp.message)" -ForegroundColor Red
  exit 1
}

# Step 2: Verify OTP
Write-Host "`n2️⃣ Verifying OTP..."
$queryJson = @{query="mutation { verifyOtp(input: { phone: `"+10000000000`", otp: `"$otp`" }) { accessToken refreshToken userId isNewUser } }"} | ConvertTo-Json
$verifyResp = Invoke-RestMethod -Uri 'http://localhost:3000/graphql' -Method Post -Body $queryJson -ContentType 'application/json'

if ($verifyResp.data.verifyOtp.accessToken) {
  Write-Host "   ✅ OTP Verification Success" -ForegroundColor Green
  Write-Host "   User ID: $($verifyResp.data.verifyOtp.userId)" -ForegroundColor Yellow
  Write-Host "   Is New User: $($verifyResp.data.verifyOtp.isNewUser)" -ForegroundColor Yellow
  Write-Host "   Access Token: $($verifyResp.data.verifyOtp.accessToken.Substring(0, 20))..." -ForegroundColor Yellow
} else {
  Write-Host "   ❌ OTP Verification Failed" -ForegroundColor Red
  Write-Host "   Response: $($verifyResp | ConvertTo-Json)" -ForegroundColor Red
  exit 1
}

Write-Host "`n✅ Full OTP Login Flow Successful!" -ForegroundColor Green
Write-Host "`n🌐 Admin Dashboard running at: http://localhost:4201" -ForegroundColor Cyan
