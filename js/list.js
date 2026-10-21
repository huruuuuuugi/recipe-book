// 一覧画面:カード表示とカテゴリの絞り込み

const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const emptyTitleEl = document.getElementById("empty-title");
const emptyNoteEl = document.getElementById("empty-note");
const countEl = document.getElementById("count");
const filterButtons = document.querySelectorAll("#filters .rb-chip");
const cardTemplate = document.getElementById("card-template");

const recipes = loadRecipes();
let currentCategory = "all";

function render() {
  const shown = recipes
    .filter((recipe) => currentCategory === "all" || recipe.category === currentCategory)
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  countEl.textContent = `${recipes.length}品`;
  listEl.replaceChildren(...shown.map(createCard));

  emptyEl.hidden = shown.length > 0;
  if (recipes.length === 0) {
    emptyTitleEl.textContent = "最初のレシピを追加しましょう";
    emptyNoteEl.textContent = "レシピはこのスマホの中に保存されます";
  } else {
    emptyTitleEl.textContent = `${categoryName(currentCategory)}のレシピはまだありません`;
    emptyNoteEl.textContent = "右下の＋追加から登録できます";
  }
}

function createCard(recipe) {
  const card = cardTemplate.content.cloneNode(true);
  card.querySelector(".rb-card").href = `detail.html?id=${encodeURIComponent(recipe.id)}`;
  fillTile(card.querySelector(".rb-card__img"), recipe);
  card.querySelector(".rb-card__title").textContent = recipe.name;
  card.querySelector('[data-field="category"]').textContent = categoryName(recipe.category);
  card.querySelector('[data-field="time"]').textContent = recipe.time ? `${recipe.time}分` : "";
  return card;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentCategory = button.dataset.category;
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    render();
  });
});

render();
