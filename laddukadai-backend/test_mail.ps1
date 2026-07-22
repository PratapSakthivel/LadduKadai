$baseUrl = "http://localhost:8080"
$headers = @{"Content-Type" = "application/json"}

Write-Host "--- TEST MAIL DELIVERY ---"
$body = '{"name":"Mail Test User","email":"mailtest5@laddukadai.com","phone":"8888888885","password":"password123","role":"CUSTOMER"}'
$res = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Headers $headers -Body $body -ErrorAction Stop
Write-Host ($res | ConvertTo-Json -Depth 2)
