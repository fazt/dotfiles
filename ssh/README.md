# ssh

Ajustes SSH **genéricos** (sin hosts concretos, seguros para repo público).

| File | Description |
|------|-------------|
| `common.conf` | Connection multiplexing (`ControlMaster`): reconexiones al mismo host instantáneas y sin contraseña. |

## Uso en un equipo nuevo

1. Crear la carpeta de sockets:
   ```bash
   mkdir -p ~/.ssh/sockets && chmod 700 ~/.ssh/sockets
   ```
2. Incluir este archivo desde `~/.ssh/config` (que NO se versiona — contiene tus hosts privados):
   ```
   Include ~/dotfiles/ssh/common.conf
   ```

Tus máquinas concretas (IP, usuario, claves) van en `~/.ssh/config`, fuera del repo.
