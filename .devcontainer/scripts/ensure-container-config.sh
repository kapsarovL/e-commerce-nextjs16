#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="${HOME}/.config/containers"
mkdir -p "${CONFIG_DIR}"

if [ ! -s "${CONFIG_DIR}/containers.conf" ] && [ -s /etc/containers/containers.conf ]; then
  cp /etc/containers/containers.conf "${CONFIG_DIR}/containers.conf"
fi
if [ ! -s "${CONFIG_DIR}/registries.conf" ] && [ -s /etc/containers/registries.conf ]; then
  cp /etc/containers/registries.conf "${CONFIG_DIR}/registries.conf"
fi
if [ ! -s "${CONFIG_DIR}/storage.conf" ] && [ -s /etc/containers/storage.conf ]; then
  cp /etc/containers/storage.conf "${CONFIG_DIR}/storage.conf"
fi

echo "container config ensured at ${CONFIG_DIR}"
exit 0