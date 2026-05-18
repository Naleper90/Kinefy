$path = "c:\Users\esana\Desktop\Kinefy\kinefy-frontend\src\styles\05-components\_dashboard.css"
$css = @"

/* Ocultar barra movil en escritorio */
@media (min-width: 769px) {
  .mobile-header,
  .mobile-nav {
    display: none !important;
  }
}
"@

Add-Content -Path $path -Value $css -Encoding UTF8
