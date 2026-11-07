---
name: commit
description: Crea un commit en formato Conventional Commits y en español a partir de los cambios en staging; úsala cuando quieras confirmar lo que ya has añadido con git add.
disable-model-invocation: true
---

# Commit

Sigue estos pasos en orden:

1. Lee los cambios en staging con `git diff --staged`.
2. Si no hay nada en staging, avisa al usuario y detente. Nunca hagas `git add` por tu cuenta.
3. Si los cambios incluyen `.env` o algo que parezca una credencial (contraseñas, tokens, claves de API, cadenas de conexión con usuario y contraseña), detente y avisa al usuario sin hacer el commit.
4. Escribe el mensaje en formato Conventional Commits con uno de estos tipos: `feat`, `fix`, `docs`, `test`, `refactor` o `chore`. Escríbelo en español y con un máximo de 72 caracteres (p. ej. `feat: añadir endpoint para registrar riegos`).
5. Muestra el mensaje al usuario y haz el commit con `git commit -m "<mensaje>"`. Nunca hagas `git push`.
