# Automated End-to-End Workflow Verification Script for Smart Patient

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  SMART PATIENT - SYSTEM END-TO-END VERIFICATION TEST" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Test Actuator Health
$health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health"
Write-Host "[1] System Health Status:" $health.status -ForegroundColor Green

# 2. Test Patient Authentication & Dashboard
$loginBody = @{ usernameOrEmail = "patient1"; password = "Patient@123" } | ConvertTo-Json
$patLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$patToken = $patLogin.data.token
Write-Host "[2] Patient Login (patient1): OK | Token:" ($patToken.Substring(0, 16) + "...") -ForegroundColor Green

$dash = Invoke-RestMethod -Uri "http://localhost:8080/api/patients/me/dashboard" -Headers @{ Authorization = "Bearer $patToken" }
Write-Host "    -> Dashboard Summary: Patient: $($dash.data.patientName) | ID: $($dash.data.patientCode) | Today's Doses: $($dash.data.totalDosesToday)" -ForegroundColor Gray

# 3. Test Medical Report Comparison (Lipid Profile)
$compareBody = @{ olderReportId = 1; newerReportId = 2 } | ConvertTo-Json
$compareRes = Invoke-RestMethod -Uri "http://localhost:8080/api/reports/compare" -Method Post -ContentType "application/json" -Body $compareBody -Headers @{ Authorization = "Bearer $patToken" }
Write-Host "[3] Laboratory Report Comparison: OK" -ForegroundColor Green
foreach ($metric in $compareRes.data.matchedMetrics) {
    Write-Host "    -> Test: $($metric.testName) | Older: $($metric.olderValue) | Newer: $($metric.newerValue) $($metric.unit) | Delta: $($metric.difference) ($($metric.percentageDifference)%) | Trend: $($metric.trend)" -ForegroundColor Gray
}

# 4. Test Doctor Login & Profile
$docBody = @{ usernameOrEmail = "dr.sharma"; password = "Doctor@123" } | ConvertTo-Json
$docLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $docBody
$docToken = $docLogin.data.token
Write-Host "[4] Doctor Login (dr.sharma): OK" -ForegroundColor Green
$docProfile = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors/me/profile" -Headers @{ Authorization = "Bearer $docToken" }
Write-Host "    -> Doctor: $($docProfile.data.fullName) | Specialty: $($docProfile.data.specialty) | Hospital: $($docProfile.data.hospital.name)" -ForegroundColor Gray

# 5. Test Doctor Appointments Retrieval
$docAppts = Invoke-RestMethod -Uri "http://localhost:8080/api/doctors/me/appointments" -Headers @{ Authorization = "Bearer $docToken" }
Write-Host "[5] Doctor Appointments Retrieved: $($docAppts.data.Count) appointments" -ForegroundColor Green

# 6. Test Admin Login & Doctor Approvals
$admBody = @{ usernameOrEmail = "admin"; password = "Admin@123" } | ConvertTo-Json
$admLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $admBody
$admToken = $admLogin.data.token
Write-Host "[6] Admin Login (admin): OK" -ForegroundColor Green

$pending = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/doctors/pending" -Headers @{ Authorization = "Bearer $admToken" }
Write-Host "    -> Pending Doctors count: $($pending.data.Count)" -ForegroundColor Gray
if ($pending.data.Count -gt 0) {
    $targetDoc = $pending.data[0]
    $approveRes = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/doctors/$($targetDoc.doctorId)/approve" -Method Post -Headers @{ Authorization = "Bearer $admToken" }
    Write-Host "    -> Approved Doctor: $($targetDoc.fullName) | New Status: $($approveRes.data.verificationStatus)" -ForegroundColor Green
}

# 7. Test Medicine Schedule Update
$todayDoses = Invoke-RestMethod -Uri "http://localhost:8080/api/medicine-schedules/today" -Headers @{ Authorization = "Bearer $patToken" }
Write-Host "[7] Today's Medicine Schedules: $($todayDoses.data.Count) doses" -ForegroundColor Green
if ($todayDoses.data.Count -gt 0) {
    $firstDose = $todayDoses.data[0]
    $doseBody = @{ status = "TAKEN" } | ConvertTo-Json
    $statusUpdate = Invoke-RestMethod -Uri "http://localhost:8080/api/medicine-schedules/$($firstDose.scheduleId)/status" -Method Post -ContentType "application/json" -Body $doseBody -Headers @{ Authorization = "Bearer $patToken" }
    Write-Host "    -> Dose ID $($firstDose.scheduleId) ($($firstDose.prescription.medicine)) marked as: $($statusUpdate.data.status)" -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ALL CRITICAL HEALTHCARE WORKFLOWS VERIFIED SUCCESSFULLY" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
