<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


## Descripcion
Este proyecto implementa una solución para comparar ofertas de tipo de cambio provenientes de múltiples APIs de remesas, con el objetivo de seleccionar y retornar la mejor conversión posible para un cliente bancario.

## 🧪 Objetivo
Consultar distintas APIs de tipo de cambio utilizando un mismo conjunto de datos (moneda origen, moneda destino y monto), procesar sus respuestas (en diferentes formatos como JSON o XML), y retornar la oferta con el mayor monto convertido en el menor tiempo posible.



## 🚀 Tecnologías
NestJS

TypeScript

xml2js para parseo de XML

Jest para pruebas unitarias

Docker (opcional)


## Project setup

### Ejecucion en docker:
### Requisitos

- Docker


```bash
docker-compose up --build -d
```

### E