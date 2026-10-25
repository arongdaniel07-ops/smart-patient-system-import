$body = @{ usernameOrEmail = "patient1"; password = "Patient@123" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body $body
$token = $auth.data.token
Write-Host "Got token: $($token.Substring(0, 10))..."

try {
    $res = Invoke-RestMethod -Uri "http://localhost:8080/api/medicine-schedules/today" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Success: Schedules count = $($res.data.Count)"
} catch {
    Write-Host "Failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Error Body: $($reader.ReadToEnd())"
    }
}
