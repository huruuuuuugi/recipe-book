// 保存・読み込みの共通処理。localStorage に触るのはこのファイルだけ。
// 将来 localForage に移るときは、このファイルだけ直せば済む。

const STORAGE_KEY = "recipes";

const CATEGORY_NAMES = {
  main: "主菜",
  side: "副菜",
  soup: "汁物",
  staple: "ご飯・麺",
};

// 全レシピを配列で返す。読めないときは空の配列
function loadRecipes() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    const recipes = text ? JSON.parse(text) : [];
    return Array.isArray(recipes) ? recipes : [];
  } catch (error) {
    console.error("レシピを読み込めませんでした", error);
    return [];
  }
}

function saveRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function getRecipe(id) {
  return loadRecipes().find((recipe) => recipe.id === id);
}

// id があれば上書き、なければ新しく追加する。保存したレシピを返す
function upsertRecipe(input) {
  const recipes = loadRecipes();
  const now = new Date().toISOString();
  const index = recipes.findIndex((recipe) => recipe.id === input.id);

  if (index === -1) {
    const recipe = { image: "", ...input, id: createId(), createdAt: now, updatedAt: now };
    recipes.push(recipe);
    saveRecipes(recipes);
    return recipe;
  }

  const recipe = { ...recipes[index], ...input, updatedAt: now };
  recipes[index] = recipe;
  saveRecipes(recipes);
  return recipe;
}

function deleteRecipe(id) {
  saveRecipes(loadRecipes().filter((recipe) => recipe.id !== id));
}

// バックアップ:全レシピを JSON 文字列にする
function exportRecipes() {
  return JSON.stringify(loadRecipes(), null, 2);
}

// バックアップを読み込む。同じ id は上書き、新しいものは追加。読み込んだ件数を返す
function importRecipes(text) {
  const incoming = JSON.parse(text);
  if (!Array.isArray(incoming) || incoming.some((r) => !r || typeof r.name !== "string")) {
    throw new Error("レシピ帳のバックアップファイルではありません");
  }

  const recipes = loadRecipes();
  incoming.forEach((recipe) => {
    const item = { ...recipe, id: recipe.id || createId() };
    const index = recipes.findIndex((r) => r.id === item.id);
    if (index === -1) {
      recipes.push(item);
    } else {
      recipes[index] = item;
    }
  });
  saveRecipes(recipes);
  return incoming.length;
}

function createId() {
  // crypto.randomUUID は HTTPS(GitHub Pages)と localhost で使える
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function categoryName(key) {
  return CATEGORY_NAMES[key] || "";
}

// レシピの画像。なければカテゴリ別の代わりのイラスト
function recipeImageSrc(recipe) {
  return recipe.image || `images/category/${recipe.category}.png`;
}

// イラストを青いタイルの中に入れる。画像がまだ無いときはタイルだけ見せる
function fillTile(tile, recipe) {
  const img = document.createElement("img");
  img.alt = "";
  img.src = recipeImageSrc(recipe);
  img.addEventListener("error", () => img.remove());
  tile.replaceChildren(img);
}
