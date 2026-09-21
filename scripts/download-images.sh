#!/bin/bash
# Download searched resin images to public/uploads with meaningful names
cd /home/z/my-project
mkdir -p public/uploads

pick() { python3 -c "
import json
d=json.load(open('scripts/$1.json'))
urls=[r['original_url'] for r in d.get('results',[]) if r.get('original_url')]
print(urls[$2] if len(urls)>$2 else '')
"; }

dl() {
  [ -z "$1" ] && { echo "SKIP $2"; return 0; }
  curl -sL --max-time 60 "$1" -o "public/uploads/$2" && echo "OK $2" || echo "FAIL $2"
}

# Pour / generic (10)
for i in 0 1 2 3 4 5 6 7 8 9; do dl "$(pick s_pour $i)" "resin-pour-$((i+1)).jpg"; done
# Art (8)
for i in 0 1 2 3 4 5 6 7; do dl "$(pick s_art $i)" "resin-art-$((i+1)).jpg"; done
# Kits (8)
for i in 0 1 2 3 4 5 6 7; do dl "$(pick s_kit $i)" "resin-kit-$((i+1)).jpg"; done
# Jewellery (6)
for i in 0 1 2 3 4 5; do dl "$(pick s_jewel $i)" "resin-jewel-$((i+1)).jpg"; done
# Tables (6)
for i in 0 1 2 3 4 5; do dl "$(pick s_table $i)" "resin-table-$((i+1)).jpg"; done
# Floors (5)
for i in 0 1 2 3 4; do dl "$(pick s_floor $i)" "resin-floor-$((i+1)).jpg"; done
# Canvas (6)
for i in 0 1 2 3 4 5; do dl "$(pick s_canvas $i)" "resin-canvas-$((i+1)).jpg"; done
# Workshop (6)
for i in 0 1 2 3 4 5; do dl "$(pick s_work $i)" "resin-work-$((i+1)).jpg"; done

echo "--- downloaded ---"
ls public/uploads/resin-*.jpg 2>/dev/null | wc -l
# remove any zero-byte / html error files
find public/uploads -name "resin-*.jpg" -size -3k -delete
ls public/uploads/resin-*.jpg 2>/dev/null | wc -l
