# Pawn Island Records Merch Market Ready Plan

Audit date: 2026-06-03

## Inputs Reviewed

- Production reference: `https://pawnislandrecords.pages.dev/merch`
- Printful API reference: `C:\Users\xxtru\Downloads\openapi.json`
- Store page shell: `merch.html`
- Store UI and business logic: `label-site.js`
- Store styling: `merch-store.css`
- Printful API layer: `functions/_lib/printful.js` and `functions/api/merch/*`
- Existing route and launch policy docs: `README.md`, `ROADMAP.md`, `tools/routes.js`
- Existing tests: `tests/merch.spec.js`, `tests/accessibility.spec.js`

## Current Production Snapshot

- The live page loads real Printful data: 14 ready-to-buy products, 84 purchasable options, and 493 Printful catalog products.
- The route is still classified as hidden-but-shareable and `noindex,follow`, but the UI copy presents it as a live store.
- The current checkout is really an order request: users add Printful sync variants to a local cart, estimate shipping, and submit customer/address data so a draft Printful order can be created manually.
- Product detail loading works: product photos, variant choices, price, quantity, add-to-cart, related products, and cart rendering are present.
- Production `/api/merch/products?status=synced` returns 14 synced products with cache headers.
- Production `/api/merch/catalog` returns 493 catalog products but normalized `categories` and `categoryTree` are empty, so catalog browsing falls back to noisy product-type labels.
- Initial production load observed roughly 4.8 seconds before the audit script sampled page state, around 4.7 MB of resource transfer, 19 images in the DOM, and several product images not fully complete at sample time.
- Desktop first viewport looks branded and functional, but several hero/showcase cards read as mostly blank white product plates.
- Mobile default browse height is very long, around 12,553px in the audit capture, before the user completes any shopping task.
- The persistent audio dock overlaps valuable bottom-of-viewport store and checkout space.

## Primary Problems To Solve

1. Store positioning is inconsistent.
   The roadmap says hidden/shareable and support-first. The UI says ready-to-ship, live checkout, all products, and product photos. Market-ready means the route classification, copy, SEO, checkout model, and navigation all agree.

2. Product merchandising is too dependent on parsed Printful names.
   Product names such as "Resunant Midnight Revival 2 Large Organic Tote Bag" become project names. Generic labels such as "Core" repeat in hero tiles and related products. This makes the store feel automated instead of curated.

3. Catalog mode is an internal product lab, not a public shopping surface.
   Showing 493 blank products beside live merch overwhelms the store and creates hundreds of one-off SKU-like filters. It should either become an internal design exploration tool or be reduced to a curated "design next" section.

4. Product imagery does not consistently sell the item.
   The strongest product photos exist, but card and hero crops often show blank white space, tiny artwork, or hard-to-read thumbnails. The first viewport promises product photos before the visual system proves desirability.

5. Checkout trust is incomplete.
   The current order desk can collect personal data, but the user is told payment and tax happen later by email. That can be acceptable for a prelaunch manual desk, but it is not a market-ready ecommerce checkout without stronger policy, receipt, support, and payment language.

6. Mobile browsing is too long and heavy.
   The page stacks hero, stats, showcase, trust bar, filters, 14 cards, and sticky/cart content into a very long mobile flow. Shoppers need a shorter default path to featured products, filter controls, detail, and checkout.

7. Technical hardening is partial.
   The same-origin Cloudflare API layer is the right foundation, but category normalization, product metadata overrides, API fallback states, rate-limit protection, and production smoke tests need to be strengthened.

## Market Ready Definition

The merch area is market-ready when a fan can:

- Understand what is for sale in the first viewport.
- See desirable, correctly cropped product imagery without blank placeholders.
- Browse a curated default collection without being exposed to internal catalog noise.
- Filter by meaningful buyer-facing concepts: artist, drop, apparel, desk gear, bags, wall art, price, and availability.
- Open a product detail page with gallery, price, available options, fit/material/care details, shipping expectations, return policy, and related items.
- Add an item to cart, understand subtotal/shipping/tax/payment status, and complete the chosen checkout path without ambiguity.
- Receive a confirmation or clear next step.
- Use the flow comfortably on mobile, keyboard, and screen readers.
- Trust the page through policies, support contact, secure API handling, accurate metadata, and no broken states.

## Strategic Decision: Public Store Or Manual Merch Desk

Before implementation, choose one of these postures:

### Option A: Public Ecommerce Store

Use this if the goal is real sales now.

- Make live Printful sync products the default and only public product set.
- Add real payment collection, preferably Stripe Checkout or another hosted payment flow.
- Create Printful orders only after payment succeeds, or create draft orders and confirm them after payment through a webhook-backed flow.
- Add public navigation, `index,follow`, sitemap inclusion, product metadata, policies, and analytics.
- Keep catalog exploration hidden from shoppers.

### Option B: Market-Ready Manual Order Desk

Use this if the label is validating demand before payment automation.

- Rename and position the flow as "Order Request" or "Merch Desk", not full checkout.
- Keep `noindex,follow` until policies, fulfillment, and payment follow-up are operationally ready.
- Make the manual next step explicit: "We will email a payment link/invoice before production."
- Add confirmation email, support address, and order SLA language.
- Still apply the visual, product metadata, mobile, accessibility, and reliability work below.

Recommendation: build the next iteration as Option B only if payment operations are not ready this week. Otherwise, go straight to Option A so design, copy, and analytics do not need to be redone.

## Phase 0: Product And Launch Alignment

Deliverables:

- A one-page launch brief defining route status, checkout model, countries served, support process, refund/cancellation rules, and whether the store appears in public nav.
- A curated launch collection list.
- A source-of-truth product metadata file.

Tasks:

- Decide whether `merch.html` remains hidden/shareable or becomes public.
- Decide whether `https://pawnislandrecords.pages.dev/merch` is only a staging reference and whether canonical production remains `https://www.pawnislandrecords.com/merch.html`.
- Decide the exact checkout model: hosted payment, manual invoice, or draft order request.
- Decide which 14 current products are launch-worthy and whether any should be hidden until imagery/name issues are fixed.
- Decide if Printful catalog mode is public, hidden behind a query flag, admin-only, or removed from the merch page.
- Define support address, response window, cancellation window, return policy, shipping countries, and fulfillment time ranges.

Acceptance criteria:

- README, ROADMAP, route inventory, page meta, and UI copy all describe the same launch posture.
- Every live product has a launch decision: public, hidden, needs imagery, needs naming, or retired.

## Phase 1: Product Metadata And Taxonomy

Deliverables:

- A structured merch metadata source, for example `data/merch-products.json`, generated into `public-data.js` or loaded by the merch renderer.
- A validation script that fails when a live Printful product lacks required merchandising metadata.

Tasks:

- Stop relying on `parsePrintfulProductName` as the primary merchandising source.
- Map each Printful sync product ID to:
  - public title
  - artist/project
  - release/drop
  - design name
  - product family
  - product type
  - buyer-facing category
  - sort priority
  - featured priority
  - public status
  - thumbnail strategy
  - hero eligibility
  - image alt text
  - material/care/fit notes
  - support copy
  - related product rules
- Normalize current product families into buyer-facing groups:
  - T-Shirts
  - Bags
  - Desk Mats
  - Posters or Wall Art, if added
  - Label Goods
- Normalize current drops:
  - Velvet Orchard / Borrowed Brightness
  - Resunant / Midnight Revival
  - Pawn Island / Stained Glass
- Replace generic "Core" with actual design names or product image labels.
- Add manual overrides for products that Printful names poorly, such as desk mats and the tote.
- Add variant metadata where Printful data is too generic: size display, color, fit, and default selected option.
- Make catalog products opt-in by curated group rather than rendering all 493 by default.

Acceptance criteria:

- No public card or product detail depends on raw Printful names for artist, release, design, or category.
- Filters contain no one-off SKU-like labels.
- Product titles are concise enough to fit mobile cards.
- Related products are curated by drop/design/product family rather than incidental parse results.

## Phase 2: Storefront Information Architecture

Deliverables:

- A redesigned merch page structure for desktop and mobile.
- A clear separation between shopping, featured drops, and product exploration.

Recommended public page structure:

1. Header and nav.
2. Compact store hero with one strong product/lifestyle image or a curated product montage.
3. Featured drop rail with 3 to 4 high-confidence products.
4. Category/filter bar.
5. Product grid.
6. Cart/order panel only when useful.
7. Trust/policy strip.
8. Support/contact and label story.

Tasks:

- Replace the broad "Merch Store" headline with a stronger store identity, for example "Pawn Island Store" or "Artist Goods".
- Keep supporting copy concrete: product families, fulfillment expectation, and payment model.
- Move the 493-product catalog out of the primary mode switch unless it is heavily curated.
- Replace "Ready to buy / Featured Rack / Printful Catalog" with buyer-oriented tabs:
  - All
  - Apparel
  - Desk Gear
  - Bags
  - Featured
- Keep "Design Next" as an internal/admin mode or a small request CTA, not a public catalog grid.
- Convert the trust bar from generic claims into specifics:
  - Printed on demand
  - Shipping estimated before payment/request
  - Secure order form
  - Label support included
- Reduce first-viewport visual density. The hero, status card, and showcase currently compete for attention.
- Decide whether the status card is necessary. If retained, make it communicate buyer value, not internal counts.

Acceptance criteria:

- First viewport communicates what is sold and shows at least one desirable actual product.
- The primary CTA takes users to purchasable products.
- Internal catalog/product-lab concepts do not appear as equal public purchase options.

## Phase 3: Visual Design System

Deliverables:

- Store-specific visual design rules that still fit the Pawn Island public site.
- Product-card and PDP image treatments that make Printful mockups look intentional.

Tasks:

- Build a consistent product image stage:
  - light products on controlled off-white plates
  - dark products on controlled warm/dark plates
  - transparent Printful previews on a deliberate background
  - no card should read as a blank rectangle
- Define card ratios and image crop rules per product family.
- Add product image loading states that match the final card size.
- Use high-confidence images for the hero and featured rail only.
- Remove repeated "Core" labels from image overlays unless they become real named collection tags.
- Make product cards more scannable:
  - title
  - artist/drop
  - product family
  - price or price range
  - option count only if useful
  - one primary action
- Avoid showing both "Details" and "Pick Option" with equal weight on every card. Prefer:
  - card click or "View"
  - primary "Choose Options"
- Tighten typography inside cards so uppercase display type does not dominate operational text.
- Ensure button text fits at all viewport widths.
- Keep the palette from becoming all black/yellow. Add restrained product-driven accents from album art and artist palettes.
- Audit nested card styling and avoid cards inside cards where section layout can be unframed.

Acceptance criteria:

- Desktop and mobile screenshots show no visually blank product tiles in the first two viewport heights.
- Product cards look like retail cards, not admin records.
- All buttons and labels fit without crowding.

## Phase 4: Product Detail Page

Deliverables:

- A market-ready product detail experience for every public product.

Tasks:

- Make product detail URLs stable and shareable.
- Consider a cleaner route strategy later, such as `/merch/product-slug`, if the static/Pages setup supports it.
- Add a gallery order per product:
  - primary product mockup
  - detail/product angle
  - artwork close-up
  - scale/lifestyle or size context when available
- Improve gallery thumbnails with accessible labels and less text overlay.
- Add product detail sections:
  - title
  - artist/drop
  - design story
  - price
  - variants
  - size guide
  - material and care
  - production and shipping estimate
  - return/cancellation policy
  - support/contact
- Add variant states:
  - unavailable
  - low confidence/missing price
  - selected
  - out of stock, if Printful exposes it
- Add a product-specific "More from this drop" section with clean thumbnails.
- Add structured `Product` and `Offer` JSON-LD only when the store becomes indexable and the offer data is accurate.

Acceptance criteria:

- Every public product can be understood without reading card/list context.
- Price and available variants are visible before add-to-cart.
- Product detail has no raw internal taxonomy in the main buyer-facing copy.

## Phase 5: Cart And Checkout

Deliverables:

- A trustworthy checkout or order-request flow with clear totals, policies, and confirmation.

Tasks for both checkout models:

- Rename "Order Desk" if the flow is manual, or make it a true checkout if payment is live.
- Persist cart in `localStorage` so accidental navigation does not erase the order.
- Add edit quantity controls inside the cart.
- Show line item price, quantity, subtotal, shipping, estimated tax if available, and total.
- Require explicit policy acknowledgement before order submission.
- Add empty, loading, success, failure, and retry states.
- Add form validation messages near fields.
- Add "same as billing/shipping" only if relevant to payment flow.
- Add privacy reassurance near address/email collection.
- Add a non-overlapping mobile cart summary pattern.

If using hosted payment:

- Add Stripe Checkout or equivalent hosted payment link/session creation.
- Create/confirm Printful order only after payment success.
- Add webhook handling for payment success/failure.
- Send customer confirmation email or integrate with the payment provider's receipt.
- Do not collect full address twice if the payment provider handles shipping address.

If staying manual:

- Change CTA from "Send Order Request" to something like "Request Invoice" or "Send Order Request".
- Add exact copy: "We will email a payment link before production begins."
- Add order confirmation email to the customer and label operator.
- Add an internal order queue or dashboard link, even if lightweight.
- Keep `MERCH_DRAFT_ORDERS_ENABLED` off in production until the operator is ready to process drafts.

Acceptance criteria:

- A shopper never has to infer whether they paid, requested, reserved, or merely contacted the label.
- No personal data is submitted without a clear purpose and next step.
- The checkout/order request flow has a tested success path and a tested failure path.

## Phase 6: Printful API And Backend Reliability

Deliverables:

- A hardened Cloudflare Functions layer that safely supports the chosen checkout model.

Relevant Printful endpoints from the local OpenAPI file:

- `/store/products`: get or create sync products.
- `/store/products/{id}`: get, modify, or delete sync products.
- `/store/products/{id}/variants`: create sync variants.
- `/products`: get catalog products.
- `/products/{id}`: get catalog product.
- `/products/variant/{id}`: get catalog variant.
- `/shipping/rates`: calculate shipping rates.
- `/orders/estimate-costs`: estimate complete order costs.
- `/orders`: create orders.
- `/orders/{id}/confirm`: confirm orders.
- `/mockup-generator/create-task/{id}` and `/mockup-generator/task`: generate and retrieve mockups.
- `/mockup-generator/printfiles/{id}`: retrieve print file requirements.
- `/webhooks`: manage webhook subscriptions.

Tasks:

- Fix catalog normalization so categories/category tree are meaningful or remove public dependency on categories.
- Add a product metadata merge layer after Printful normalization.
- Add defensive API schemas for product, detail, shipping, and order responses.
- Add cache strategy:
  - short cache for synced products and details
  - longer cache for catalog products
  - stale fallback for product listing
  - no-store for checkout/order operations
- Respect Printful's general 120 calls/minute rate limit and lower limits on mockup-generator endpoints.
- Avoid preloading detailed product data for too many products on initial load.
- Add request logging with redacted PII.
- Add bot protection/rate limiting on draft order and shipping endpoints.
- Add CSRF-style same-origin checks for POST endpoints.
- Add structured error responses and user-facing error copy.
- Add environment guards so production cannot accidentally create confirmed Printful orders during testing.
- If payment is added, add idempotency keys for order creation.
- Add webhook signature verification if using Printful or payment provider webhooks.

Acceptance criteria:

- No Printful token leaks to the browser.
- API failures degrade into useful storefront states.
- Shipping/order endpoints reject malformed or abusive requests.
- Order creation is idempotent and recoverable.

## Phase 7: Mobile And Global Site Chrome

Deliverables:

- A mobile store flow that does not feel like an endless admin list.

Tasks:

- Reduce mobile hero height and remove nonessential status content from the top.
- Collapse filters into a drawer or segmented control.
- Show featured products before the full product list.
- Add "jump to cart" only after cart has items.
- Make the cart a bottom sheet or dedicated checkout section on mobile.
- Add bottom padding or adaptive collapse behavior so the audio dock does not cover checkout controls.
- Consider disabling or minimizing the audio dock on checkout/order form focus.
- Validate all form controls above the mobile keyboard.
- Keep touch targets at least 40px and preferably 44px.
- Test at 390px, 430px, 768px, 1024px, 1440px, and 1920px widths.

Acceptance criteria:

- Mobile first action is clear within one screen.
- The user can add to cart and complete the form without controls hidden behind the audio dock.
- No horizontal overflow and no text overlap.

## Phase 8: SEO, Social, Legal, And Trust

Deliverables:

- Public launch metadata and policy infrastructure.

Tasks:

- If public, change `merch.html` robots from `noindex,follow` to `index,follow`.
- Update route classification in `tools/routes.js`, `README.md`, `ROADMAP.md`, `robots.txt`, and `sitemap.xml`.
- Ensure production canonical URLs use the intended domain, not the Pages preview URL.
- Add social preview image specific to the store or featured drop.
- Add product-level metadata for selected products.
- Add policy pages or sections:
  - shipping
  - returns/refunds
  - cancellations
  - privacy
  - terms/contact
- Add visible support/contact link near checkout and product detail.
- Add fulfillment transparency: "Printed/fulfilled via Printful" if that is the desired trust posture.
- Add analytics events:
  - view_store
  - select_category
  - view_item
  - choose_option
  - add_to_cart
  - estimate_shipping
  - begin_checkout
  - submit_order_request or purchase
  - support_click
  - checkout_error

Acceptance criteria:

- Search and social metadata match the store's actual launch status.
- Product and checkout policy information is visible before submission.
- Analytics can answer which products, drops, and checkout steps are working.

## Phase 9: Accessibility And Quality

Deliverables:

- Automated and manual quality gates that protect the store after launch.

Tasks:

- Expand `tests/merch.spec.js` beyond mocked happy paths:
  - production-shaped fixtures for the 14 live products
  - empty products state
  - API failure state
  - slow image state
  - missing variant state
  - shipping rate failure
  - draft order disabled
  - draft order success
- Add tests for metadata overrides and product parsing fallback.
- Add tests that ensure catalog mode is hidden or curated according to the launch decision.
- Add Playwright screenshot checks for:
  - desktop store
  - mobile store
  - product detail
  - cart with item
  - error state
- Run axe accessibility checks on merch with real-ish product cards, not only small fixtures.
- Test keyboard flow:
  - skip link
  - filters
  - product cards
  - gallery
  - variant picker
  - cart
  - checkout form
- Test screen-reader labels for gallery thumbnails, quantity controls, cart removal, and status messages.
- Add performance budgets:
  - initial page JS/CSS budget
  - image transfer budget
  - maximum initial product images
  - API response timing budget
- Add link checks for policy, support, and product URLs.

Acceptance criteria:

- No serious or critical axe violations.
- No console errors on production-like merch routes.
- No broken API route in the chosen storefront path.
- Visual regression protects against blank first-viewport product tiles.

## Phase 10: Launch Rollout

Suggested sequence:

1. Freeze the launch posture.
2. Build product metadata overrides.
3. Hide or curate catalog mode.
4. Redesign hero, cards, filters, mobile flow, and image treatments.
5. Upgrade product detail pages.
6. Upgrade cart and checkout/order request copy.
7. Harden API and error states.
8. Add policies, support, metadata, and analytics.
9. Run full desktop/mobile/accessibility/checkout QA.
10. Flip route classification and navigation only when checkout and policy criteria pass.

Launch checklist:

- All public products have metadata overrides.
- No visible card uses raw messy Printful names.
- No visible product tile is blank or misleading.
- Product detail works for every public product.
- Add to cart works for every public variant.
- Shipping estimate works or fails gracefully.
- Checkout/order request submits through the intended production-safe flow.
- Customer sees a confirmation and next step.
- Operator receives or can find the order.
- Policies and support are visible.
- Mobile cart is not blocked by the audio dock.
- Route meta and robots match launch status.
- Tests pass.
- Production smoke screenshots are approved.

## Proposed Acceptance Metrics

- Store first meaningful content under 2 seconds on a normal broadband connection.
- Product grid interactive under 3 seconds.
- Initial page transfer under 3 MB before product detail interaction, excluding user-initiated gallery loads.
- No more than 6 product images requested before the user reaches the grid.
- Mobile default page length reduced by at least 35 percent from the audited 12,553px baseline, or replaced with progressive disclosure.
- Zero serious/critical accessibility violations.
- Zero checkout-blocking console or API errors.
- 100 percent of public products have title, category, artist/drop, alt text, primary image, price/variant state, and policy coverage.

## Recommended First Sprint

The highest-leverage first sprint is:

1. Add product metadata overrides for the current 14 live products.
2. Hide public catalog mode or move it behind an internal query flag.
3. Redesign the first viewport and product card image treatment so no tile reads blank.
4. Shorten mobile flow and fix audio dock overlap during store/cart interactions.
5. Rename and tighten checkout copy according to the chosen payment/manual posture.
6. Add production-shaped visual smoke tests for desktop, mobile, PDP, and cart.

This sprint would make the store feel curated and trustworthy before deeper payment automation begins.
