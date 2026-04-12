#!/usr/bin/env sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

cd "$ROOT_DIR"

if [ ! -x vendor/bin/openapi ]; then
    echo "swagger-php is not installed. Run 'composer install' first." >&2
    exit 1
fi

mkdir -p docs

vendor/bin/openapi --version 3.1.0 --format yaml --output docs/openapi.yaml app
vendor/bin/openapi --version 3.1.0 --format json --output docs/openapi.json app
