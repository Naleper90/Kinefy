$path = "c:\Users\esana\Desktop\Kinefy\kinefy-frontend\src\styles\05-components\_dashboard.css"
$content = Get-Content $path
$content = $content -replace 'content: " \\;', 'content: "";'
$content | Set-Content $path
