# Makefile

.PHONY: up down stop logs restart ps

## GLOBAL COMMANDS
up:
	docker compose up -d --build

down:
	docker compose down --volumes

stop:
	docker compose stop

logs:
	docker compose logs -f

restart:
	make down && make up

ps:
	docker compose ps

## SERVICE SPECIFIC LOGS
logs-gateway:
	docker compose logs -f api-gateway

logs-auth:
	docker compose logs -f auth-microservice

logs-users:
	docker compose logs -f users-microservice

logs-products:
	docker compose logs -f products-microservice

logs-orders:
	docker compose logs -f orders-microservice

logs-cart:
	docker compose logs -f cart-microservice

logs-notification:
	docker compose logs -f notification-microservice

logs-shipping:
	docker compose logs -f shipping-microservice

logs-stock:
	docker compose logs -f stock-microservice

## SERVICE SPECIFIC RESTART
restart-gateway:
	docker compose restart api-gateway

restart-auth:
	docker compose restart auth-microservice