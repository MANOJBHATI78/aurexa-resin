#!/bin/bash
# Persistent dev server starter — double-fork so the process survives the tool session
cd /home/z/my-project
setsid sh -c 'exec bun run dev' </dev/null >/dev/null 2>&1 &
exit 0
