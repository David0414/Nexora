from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen, Request
import re

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets'
OUT.mkdir(exist_ok=True)
ASSETS = {
 'crowd.webp': 'https://framerusercontent.com/images/0OweuTthx3Dz38pzze75lZw78M.webp?scale-down-to=2048',
 'coffee.jpg': 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=800&q=85&fm=jpg&auto=format',
 'fitness.jpg': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=85&fm=jpg&auto=format',
 'beauty.jpg': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=85&fm=jpg&auto=format',
 'studio.jpg': 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=800&q=85&fm=jpg&auto=format',
 'case-dental.webp': 'https://framerusercontent.com/images/iQ0lX69C3YgeRjqffxWadnnAmnc.webp?scale-down-to=1024',
 'team-1.webp': 'https://framerusercontent.com/images/HxGAwVNM9ZaaBu6N5yRyWcYxYQM.webp?scale-down-to=512',
 'team-2.webp': 'https://framerusercontent.com/images/JXNHKwjRlDqIdZuxCrbzCaz9Td8.webp?scale-down-to=512',
 'team-3.webp': 'https://framerusercontent.com/images/371lVaDSMdqEsHSlTLGeKl7650.webp?scale-down-to=512',
 'team-4.webp': 'https://framerusercontent.com/images/NmkpUVq1OjshWo3MRYHXbDUFJGU.webp?scale-down-to=512',
 'team-5.webp': 'https://framerusercontent.com/images/wTEJQWR3N9EVhTU88mXAPHBq5g4.webp?scale-down-to=512',
 'team-6.webp': 'https://framerusercontent.com/images/LBJSHBzWF5iwJGgfJgtazdyk8.webp?scale-down-to=512',
 'insight-1.webp': 'https://framerusercontent.com/images/pHOBF7LHy4BbDr36flWPxPYRixo.webp?scale-down-to=1024',
 'insight-2.webp': 'https://framerusercontent.com/images/87wKn5rFSjsCMUA9My0OUYJ4dM.webp?scale-down-to=512',
 'insight-3.webp': 'https://framerusercontent.com/images/NtmyAnUBIcfQXkgdgwQGB2dIVY.webp?scale-down-to=512',
}

def fetch(item):
 name, url = item
 with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=40) as response:
  data = response.read()
 (OUT / name).write_bytes(data)
 return f'{name}: {len(data)} bytes'

if __name__ == '__main__':
 with ThreadPoolExecutor(max_workers=5) as pool:
  for result in pool.map(fetch, ASSETS.items()): print(result)
 url = 'https://fonts.googleapis.com/css2?family=Funnel+Display:wght@300..800&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&family=Geist+Mono:wght@300..600&display=swap'
 css = urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read().decode()
 for i, fonturl in enumerate(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)', css))):
  name = f'font-{i}.woff2'
  fetch((name, fonturl))
  css = css.replace(fonturl, f'../assets/{name}')
 (ROOT / 'src' / 'fonts.css').write_text(css, encoding='utf-8')
 print('Fonts downloaded')
