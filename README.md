# Il Coraggio di Fiorire

Pagina pubblica statica del brand "Il Coraggio di Fiorire".

- `index.html` — pagina principale, single-file (font, immagini e favicon embedded in base64). Deve restare `index.html` (non rinominarlo/spostarlo): è quello che GitHub Pages serve alla root, così l'URL resta sempre `https://ilcoraggiodifiorire.it/` senza mai comparire un nome di file diverso nella barra indirizzi.
- `CNAME` — dominio personalizzato.
- `favicon.ico` — favicon alla radice del dominio (richiesta automaticamente dai browser indipendentemente dai tag `<link>`).
- `og-image.jpg` — immagine di anteprima usata dai tag Open Graph/Twitter Card per la card di condivisione su WhatsApp, Telegram, Facebook, ecc.

## Hosting

Statico su GitHub Pages (**Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**).

Dominio proprio attivo: **ilcoraggiodifiorire.it** (DNS su Aruba, puntato a GitHub Pages).
