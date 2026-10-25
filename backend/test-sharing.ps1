# Test Patient-Controlled Sharing Workflow

$patLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ usernameOrEmail = "patient1"; password = "Patient@123" } | ConvertTo-Json)
$patToken = $patLogin.data.token

# 1. Patient Creates Sharing Grant with Doctor ID 1 (Dr. Rajesh Sharma)
$shareBody = @{
    doctorId = 1;
    categoryScope = "LAB_REPORTS,PRESCRIPTIONS";
    durationHours = 24
} | ConvertTo-Json

$shareRes = Invoke-RestMethod -Uri "http://localhost:8080/api/shares" -Method Post -ContentType "application/json" -Body $shareBody -Headers @{ Authorization = "Bearer $patToken" }
$shareCode = $shareRes.data.sharingCode
$shareId = $shareRes.data.shareId
Write-Host "Created Share ID: $shareId | Generated Code: $shareCode | Scope: $($shareRes.data.categoryScope)" -ForegroundColor Green

# 2. Doctor Redeems Sharing Code
$docLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{ usernameOrEmail = "dr.sharma"; password = "Doctor@123" } | ConvertTo-Json)
$docToken = $docLogin.data.token

$redeemBody = @{ sharingCode = $shareCode } | ConvertTo-Json
$redeemRes = Invoke-RestMethod -Uri "http://localhost:8080/api/shares/redeem" -Method Post -ContentType "application/json" -Body $redeemBody -Headers @{ Authorization = "Bearer $docToken" }
Write-Host "Doctor Redeemed Code: Status = $($redeemRes.data.status) | Patient = $($redeemRes.data.patient.fullName)" -ForegroundColor Green

# 3. Patient Revokes Sharing Grant
$revokeRes = Invoke-RestMethod -Uri "http://localhost:8080/api/shares/$shareId/revoke" -Method Post -Headers @{ Authorization = "Bearer $patToken" }
Write-Host "Revoked Share ID $($shareId): Status = $($revokeRes.data.status)" -ForegroundColor Green
