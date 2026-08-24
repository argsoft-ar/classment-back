.PHONY: up down restart dev build start \
        db-generate db-migrate db-push db-reset db-studio db-seed \
        install lint help

# ── Docker ──────────────────────────────────────────────────────────────────

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

# ── App ──────────────────────────────────────────────────────────────────────

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

# ── Database ─────────────────────────────────────────────────────────────────

db-generate:
	npx prisma generate

db-migrate:
	npx prisma migrate dev

db-push:
	npx prisma db push

db-reset:
	npx prisma migrate reset --force

db-studio:
	npx prisma studio

db-seed:
	npx prisma db seed

# ── Combinados ───────────────────────────────────────────────────────────────

# Levanta Postgres y aplica migraciones pendientes
setup: up db-migrate db-generate

# Reset completo: baja contenedores, sube, resetea DB y regenera cliente
reset: down up db-reset db-generate

# ── Ayuda ────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  Classment Backend — comandos disponibles"
	@echo ""
	@echo "  Docker"
	@echo "    make up          Levanta contenedores (Postgres)"
	@echo "    make down        Detiene contenedores"
	@echo "    make restart     Reinicia contenedores"
	@echo ""
	@echo "  App"
	@echo "    make install     Instala dependencias npm"
	@echo "    make dev         Inicia en modo desarrollo (ts-node-dev)"
	@echo "    make build       Compila TypeScript"
	@echo "    make start       Ejecuta el build compilado"
	@echo "    make lint        Corre ESLint"
	@echo ""
	@echo "  Base de datos"
	@echo "    make db-generate Genera el cliente Prisma"
	@echo "    make db-migrate  Crea y aplica una nueva migración"
	@echo "    make db-push     Sincroniza schema sin migraciones (dev rápido)"
	@echo "    make db-reset    Resetea la DB y re-aplica todas las migraciones"
	@echo "    make db-studio   Abre Prisma Studio en el browser"
	@echo "    make db-seed     Ejecuta el seed de datos iniciales"
	@echo ""
	@echo "  Combinados"
	@echo "    make setup       up + db-migrate + db-generate"
	@echo "    make reset       down + up + db-reset + db-generate"
	@echo ""
