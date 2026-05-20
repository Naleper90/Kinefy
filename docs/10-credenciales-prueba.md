# 10. Credenciales de Prueba

Para facilitar la evaluación del proyecto por parte del tribunal y de los docentes, se incluyen dos cuentas de referencia que pueden utilizarse sin necesidad de crear usuarios nuevos.

## 🔐 Cuenta de **Fisioterapeuta** (admin)
- **Email:** `fisio@test.com`
- **Contraseña:** `FisioDemo2026`
- **Rol:** `fisioterapeuta`
- **Permisos:** Acceso completo a la gestión de pacientes, creación de rutinas, reset de contraseñas y visualización de auditorías.

## 🧑‍⚕️ Cuenta de **Paciente** (demo)
- **Email:** `paciente@test.com`
- **Contraseña:** `PacienteDemo2026`
- **Rol:** `paciente`
- **Características:** Paciente pre‑creado asociado al fisioterapeuta anterior, con algunos ejercicios asignados y datos de evolución cargados para poder demostrar la visualización de gráficas y la captura de la escala EVA.

> **Nota:** Ambas cuentas están creadas en la base de datos de desarrollo (MongoDB local). Si los contenedores se vuelven a crear (`docker compose down && docker compose up -d`), los datos persisten gracias al volumen configurado para MongoDB.

## 📧 Pruebas de envío de correo
- El backend está configurado para usar **Mailtrap** (ver `.env`).
- Cuando se crea o se restablece la contraseña del paciente, el correo se envía a la caja de Mailtrap configurada.
- Para observar el mensaje, abre tu bandeja de Mailtrap y busca el correo con asunto **"Bienvenido/a a Kinefy"** o **"Restablecer contraseña"**.
- No es necesario disponer de un correo real; Mailtrap captura los envíos sin enviarlos a usuarios externos.
