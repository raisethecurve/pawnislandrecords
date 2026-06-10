# Cloudflare R2 Media Setup

Use this when moving checked-in public media from `media/` to a Cloudflare R2 bucket served at `https://media.pawnislandrecords.com`.

## Recommended Shape

- Bucket: `pawn-island-records-media`
- Custom domain: `media.pawnislandrecords.com`
- Local source folder: `media/`
- R2 object keys: relative to `media/`
- Example: `media/public/albums/rhea_hearth.png` becomes `https://media.pawnislandrecords.com/public/albums/rhea_hearth.png`

The site keeps local `media/...` paths in `public-data.js` so tests and localhost stay simple. Production uses the main site origin by default for committed media files. Set `PAWN_MEDIA_ORIGIN=https://media.pawnislandrecords.com` only when the R2 bucket is intentionally synced and should be the canonical media origin.

## One-Time Cloudflare Setup

Cloudflare docs worth keeping nearby:

- R2 public buckets and custom domains: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Wrangler R2 commands: https://developers.cloudflare.com/r2/reference/wrangler-commands/
- R2 CORS policy: https://developers.cloudflare.com/r2/buckets/cors/

1. Enable R2 for the Cloudflare account.

   Cloudflare currently gates first-time R2 use behind the dashboard. Open the active `pawnislandrecords.com` account and enable R2 once before creating buckets through the API.

2. Provide Cloudflare credentials for non-interactive local setup, or use the `@cloudflare` plugin directly.

   ```powershell
   $env:CLOUDFLARE_API_TOKEN = "..."
   $env:CLOUDFLARE_ACCOUNT_ID = "..."
   ```

   `CLOUDFLARE_ZONE_ID` is optional if the token can read the `pawnislandrecords.com` zone.

   The token needs account-level R2 write access for bucket setup and object uploads. If the script is attaching `media.pawnislandrecords.com`, include access to read the `pawnislandrecords.com` zone and edit DNS for that zone.

3. Run the account setup script.

   ```sh
   npm run setup:r2:media
   ```

   This creates/verifies the bucket, applies `config/r2-cors.json`, and attaches `media.pawnislandrecords.com` through the Cloudflare API.

4. Authenticate Wrangler only if you are using the local upload helper.

   ```sh
   npx wrangler login
   ```

5. Create the bucket manually only if you are not using `npm run setup:r2:media` or `@cloudflare`.

   ```sh
   npx wrangler r2 bucket create pawn-island-records-media
   ```

6. In Cloudflare Dashboard, open R2, select the bucket, go to Settings, and add `media.pawnislandrecords.com` under Custom Domains only if you are not using `npm run setup:r2:media` or `@cloudflare`.

   The `pawnislandrecords.com` zone needs to be in the same Cloudflare account as the R2 bucket. Keep `r2.dev` public access off for production unless you need a temporary test URL.

7. Apply the read-only CORS policy manually only if you are not using `npm run setup:r2:media` or `@cloudflare`.

   ```sh
   npx wrangler r2 bucket cors set pawn-island-records-media --file config/r2-cors.json --force
   npx wrangler r2 bucket cors list pawn-island-records-media
   ```

8. Dry-run the media upload.

   ```sh
   npm run sync:r2:media
   ```

9. Upload the media objects.

   ```sh
   npm run sync:r2:media -- --execute
   ```

10. Verify the bucket contents after the custom domain status is Active.

   ```sh
   npm run verify:r2:media
   ```

11. Verify one object directly if you need a quick manual smoke check.

   ```sh
   curl -I https://media.pawnislandrecords.com/public/albums/rhea_hearth.png
   ```

## Ongoing Use

- Add or replace files under `media/`.
- Run `npm run sync:r2:media` to inspect object keys.
- Run `npm run sync:r2:media -- --execute` to upload.
- Run `npm run verify:r2:media` to confirm every local media file is reachable from the media domain.
- Run `npm run generate:seo` after media URL policy changes. It points social/search image URLs at the main site by default; set `PAWN_MEDIA_ORIGIN` first only when the R2 bucket should be canonical.

The default uploaded `Cache-Control` is `public, max-age=86400, stale-while-revalidate=604800`, because these filenames are readable but not content-hashed. If an existing object is replaced and the public URL must update immediately, purge `media.pawnislandrecords.com` in Cloudflare.

Useful overrides:

```sh
PAWN_R2_BUCKET=pawn-island-records-media npm run sync:r2:media -- --execute
PAWN_R2_CACHE_CONTROL="public, max-age=3600" npm run sync:r2:media -- --execute
PAWN_MEDIA_ORIGIN=https://media.pawnislandrecords.com npm run generate:seo
npm run verify:r2:media -- --filter quiet_worn_away
```
