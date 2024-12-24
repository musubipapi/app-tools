.PHONY: build

build:
	(set -a; source .env; set +a; ./build.sh)
