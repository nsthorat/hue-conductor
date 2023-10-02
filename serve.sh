#!/bin/bash
set -e

npx http-server ./build -p 8080 --open
