#!/bin/bash
# Run all resin image searches; strip CLI preamble; keep pure JSON
cd /home/z/my-project/scripts

extract() { python3 -c "
import sys
raw = open('$1.raw', encoding='utf-8', errors='ignore').read()
i = raw.find('{')
open('$1.json','w').write(raw[i:] if i >= 0 else '{\"success\": false}')
"; }

run() { # run <basename> <query> <count>
  echo "=== $1 ==="
  z-ai image-search -q "$2" --count "$3" --gl us --no-rank > "$1.raw" 2>/dev/null
  extract "$1"
  python3 -c "import json;d=json.load(open('$1.json'));print('$1', d.get('success'), d.get('count'))"
}

run s_art "colorful epoxy resin art coasters and trays finished pieces" 8
run s_kit "epoxy resin and hardener two part bottles kit packaging" 8
run s_jewel "resin jewellery pendant epoxy casting handmade" 6
run s_table "epoxy river table wood slab glossy finish" 6
run s_floor "metallic pigmented epoxy floor countertop marble effect" 5
run s_canvas "artist pouring pigmented resin on canvas abstract art" 6
run s_work "hands mixing epoxy resin in cups workshop gloves" 6
echo "ALL DONE"
