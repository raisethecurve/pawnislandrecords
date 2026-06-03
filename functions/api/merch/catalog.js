import {
  apiErrorResponse,
  attachCatalogCategories,
  buildActiveCatalogTree,
  emptyOptionsResponse,
  jsonResponse,
  normalizeCatalogCategory,
  normalizeCatalogProduct,
  printfulFetch,
  resultArray
} from "../../_lib/printful.js";

export async function onRequestOptions() {
  return emptyOptionsResponse();
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const categoryId = url.searchParams.get("category_id") || "";
    const productQuery = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : "";
    const [categoryResponse, productResponse] = await Promise.all([
      printfulFetch(context, "/categories"),
      printfulFetch(context, `/products${productQuery}`)
    ]);
    const rawCategories = resultArray(categoryResponse.data);
    const rawProducts = resultArray(productResponse.data);
    const categories = rawCategories
      .map(normalizeCatalogCategory)
      .filter((category) => category.id && category.title);
    const products = attachCatalogCategories(
      rawProducts
        .map(normalizeCatalogProduct)
        .filter((product) => product.id && !product.isDiscontinued),
      categories
    );

    return jsonResponse(
      {
        source: "printful-v1-catalog",
        categoryId,
        syncedAt: new Date().toISOString(),
        categories,
        categoryTree: buildActiveCatalogTree(categories, products),
        products
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=1800"
        }
      }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
