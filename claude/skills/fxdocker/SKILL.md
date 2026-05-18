---
name: fxdocker
description: guidelines to create a docker compose
---

if i ask for a docker compose is for developemnt so:

- verify first if the service is running usibg docker ps
- if the port is allocated to another service, change the port to the next one available
- I dont newed to use volumes
- I need to use the latest image of the service