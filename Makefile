.PHONY: install up down migrate fresh seed shell thinker db send logs deploy

PHP = docker compose exec app
NPM = docker compose run --rm frontend

install:
	@echo "→ Subindo banco de dados..."
	docker compose up -d db
	@echo "→ Construindo imagem PHP..."
	docker compose build app
	@echo "→ Criando projeto Laravel base..."
	docker compose run --rm -u root app sh -c "composer create-project laravel/laravel /tmp/laravel-base --no-interaction --quiet && cp -rn /tmp/laravel-base/. /var/www/backend/ && chown -R www:www /var/www/backend"
	@echo "→ Instalando laravel/sanctum..."
	docker compose run --rm app composer require laravel/sanctum --no-interaction --quiet
	@echo "→ Copiando .env..."
	cp backend/.env.example backend/.env
	@echo "→ Gerando chave da aplicação..."
	docker compose run --rm app php artisan key:generate
	@echo "→ Subindo serviços..."
	docker compose up -d app nginx db
	@echo "→ Aguardando banco de dados..."
	sleep 5
	@echo "→ Rodando migrations e seeders..."
	$(PHP) php artisan migrate --seed --force
	@echo "→ Instalando dependências do frontend..."
	npm install
	@echo ""
	@echo "✓ Instalação concluída!"
	@echo "  Backend API:   http://localhost:8080/api"
	@echo "  Frontend dev:  npm run dev (http://localhost:5173)"
	@echo "  Gestor:        gestor@instrucao.com / 123456"
	@echo "  Líder:         lider@instrucao.com  / 123456"
	@echo "  Mecânico:      mecanico@instrucao.com / 123456"
	@echo "  Operador:      operador@instrucao.com / 123456"

up:
	docker compose up -d app nginx db
	@echo "✓ Backend rodando em http://localhost:8080"

down:
	docker compose down

dev:
	npm run dev

migrate:
	$(PHP) php artisan migrate

fresh:
	$(PHP) php artisan migrate:fresh --seed

seed:
	$(PHP) php artisan db:seed

shell:
	$(PHP) bash

thinker:
	$(PHP) php artisan tinker

db:
	docker compose exec db mysql -u manutencao -psecret manutencao

# Porta externa do MySQL: 3307 (3306 é usado pelo Figurex)

logs:
	docker compose logs -f app

send:
	npx prettier --write "src/**/*.{ts,tsx}" 2>/dev/null || true
	@read -p "Mensagem do commit: " msg; \
	git add -A && git commit -m "$$msg" && git push

deploy:
	@echo "→ Baixando atualizações..."
	git pull origin main
	@echo "→ Instalando dependências do frontend..."
	npm ci --silent
	@echo "→ Build do frontend..."
	npm run build
	@echo "→ Reiniciando containers..."
	docker compose up -d --build app nginx db scheduler
	@echo "→ Rodando migrations..."
	$(PHP) php artisan migrate --force
	$(PHP) php artisan config:cache
	$(PHP) php artisan route:cache
	@echo "✓ Deploy concluído!"
