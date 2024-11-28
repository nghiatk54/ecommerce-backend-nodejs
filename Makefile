APP_NAME=server

run:
	docker compose up -d && node --watch $(APP_NAME).js
dev:
	node --watch $(APP_NAME).js
up:
	docker compose up -d
down:
	docker compose down