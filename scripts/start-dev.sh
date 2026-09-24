#!/bin/bash
# Persistent dev server starter — double-fork so the process survives the tool session
# Kills any existing dev server first to guarantee fresh code/Prisma client pickup.
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "bun run dev" 2>/dev/null
sleep 1
setsid sh -c 'exec bun run dev' </dev/null >/home/z/my-project/dev.log 2>&1 &
exit 0
