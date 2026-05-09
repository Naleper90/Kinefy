import os

path = r'c:\Users\esana\Desktop\Kinefy\kinefy-frontend\src\styles\05-components\_dashboard.css'

with open(path, 'rb') as f:
    content = f.read()

# Definimos las cadenas exactas en bytes
target1 = b'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
replacement1 = b'cubic-bezier(0.4, 0, 0.2, 1)'

target2 = b'transition: height'
replacement2 = b'transition: opacity'

# Realizamos el reemplazo global
new_content = content.replace(target1, replacement1)
new_content = new_content.replace(target2, replacement2)

if new_content != content:
    with open(path, 'wb') as f:
        f.write(new_content)
    print("CSS limpiado de alertas exitosamente.")
else:
    print("No se encontraron las cadenas para reemplazar.")
