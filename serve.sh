#!/bin/bash
set -e

bun http-server ./build -p 8080 --open
