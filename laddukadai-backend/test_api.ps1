$baseUrl = "http://localhost:8080"
$headers = @{"Content-Type" = "application/json"}

Write-Host "--- TEST 1 ---"
$body1 = '{"name":"Admin Owner","email":"owner123@laddukadai.com","phone":"9876543290","password":"password123","role":"OWNER"}'
$res1 = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Headers $headers -Body $body1 -ErrorAction Stop
Write-Host ($res1 | ConvertTo-Json -Depth 2)

Write-Host "`n--- TEST 2 ---"
$body2 = '{"name":"Customer One","email":"customer1@laddukadai.com","phone":"9876543291","password":"password123","role":"CUSTOMER"}'
$res2 = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Headers $headers -Body $body2 -ErrorAction Stop
Write-Host ($res2 | ConvertTo-Json -Depth 2)
$refCode = $res2.referralCode

Write-Host "`n--- TEST 3 ---"
$body3 = '{"name":"Customer Two","email":"customer2@laddukadai.com","phone":"9876543292","password":"password123","role":"CUSTOMER","referredByCode":"' + $refCode + '"}'
$res3 = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Headers $headers -Body $body3 -ErrorAction Stop
Write-Host ($res3 | ConvertTo-Json -Depth 2)

Write-Host "`n--- TEST 4 ---"
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Headers $headers -Body $body1 -ErrorAction Stop
} catch {
    Write-Host $_.Exception.Response.StatusCode
    Write-Host (new-object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
}

Write-Host "`n--- TEST 5 ---"
$body5 = '{"name":"Admin Clone","email":"owner456@laddukadai.com","phone":"9876543290","password":"password123","role":"OWNER"}'
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Headers $headers -Body $body5 -ErrorAction Stop
} catch {
    Write-Host $_.Exception.Response.StatusCode
    Write-Host (new-object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
}

Write-Host "`n--- TEST 6 ---"
$body6 = '{"email":"owner123@laddukadai.com","password":"password123"}'
$res6 = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -Headers $headers -Body $body6 -ErrorAction Stop
Write-Host ($res6 | ConvertTo-Json -Depth 2)
$token = $res6.token

Write-Host "`n--- TEST 7 ---"
$body7 = '{"email":"owner123@laddukadai.com","password":"wrongpassword"}'
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -Headers $headers -Body $body7 -ErrorAction Stop
} catch {
    Write-Host $_.Exception.Response.StatusCode
    Write-Host (new-object IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd()
}

Write-Host "`n--- TEST 8 ---"
$authHeaders = @{"Authorization" = "Bearer $token"}
$res8 = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/auth/me" -Headers $authHeaders -ErrorAction Stop
Write-Host ($res8 | ConvertTo-Json -Depth 2)

Write-Host "`n--- TEST 9 ---"
try {
    Invoke-RestMethod -Method Get -Uri "$baseUrl/api/auth/me" -ErrorAction Stop
} catch {
    Write-Host $_.Exception.Response.StatusCode
}

Write-Host "`n--- TEST 10 ---"
$body10 = '{"name":"Delivery Guy","email":"delivery123@laddukadai.com","phone":"9876543293","password":"password123","role":"DELIVERY_MAN"}'
$res10 = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Headers $headers -Body $body10 -ErrorAction Stop
Write-Host ($res10 | ConvertTo-Json -Depth 2)
