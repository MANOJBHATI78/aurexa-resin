#!/bin/bash
# Persistent PRODUCTION server starter — same double-fork pattern as start-dev.sh
cd /home/z/my-project
setsid sh -c 'exec node .next/standalone/server.js' </dev/null >/home/z/my-project/prod.log 2>&1 &
exit 0
