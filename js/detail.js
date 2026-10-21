// 詳細画面:URL の id のレシピを表示し、編集・削除へつなぐ

const id = new URLSearchParams(location.search).get("id");
const recipe = id ? getRecipe(id) : undefined;

if (recipe) {
  showRecipe(recipe);
} else {
  document.getElementById("not-found").hidden = false;
}

function showRecipe(recipe) {
  document.title = `${recipe.name} | レシピ帳`;
  fillTile(document.getElementById("hero"), recipe);
  document.getElementById("name").textContent = recipe.name;
  document.getElementById("category").textContent = categoryName(recipe.category);

  const timeEl = document.getElementById("time");
  timeEl.textContent = `${recipe.time}分`;
  timeEl.hidden = !recipe.time;

  fillList("ingredients", recipe.ingredients);
  fillList("steps", recipe.steps);

  document.getElementById("memo").textContent = recipe.memo;
  document.getElementById("memo-section").hidden = !recipe.memo;

  const editUrl = `form.html?id=${encodeURIComponent(recipe.id)}`;
  document.getElementById("edit").href = editUrl;
  const editTop = document.getElementById("edit-top");
  editTop.href = editUrl;
  editTop.hidden = false;

  document.getElementById("delete").addEventListener("click", () => confirmDelete(recipe));
  document.getElementById("recipe").hidden = false;
}

// 1行=1要素の配列を <li> にする。空なら見出しごと隠す
function fillList(name, lines = []) {
  const items = lines.map((line) => {
    const li = document.createElement("li");
    if (name === "steps") {
      // 番号は CSS の ::before が入れる。本文は2列目に置く
      const span = document.createElement("span");
      span.textContent = line;
      li.append(span);
    } else {
      li.textContent = line;
    }
    return li;
  });
  document.getElementById(name).replaceChildren(...items);
  document.getElementById(`${name}-section`).hidden = items.length === 0;
}

async function confirmDelete(recipe) {
  const styles = getComputedStyle(document.documentElement);
  const result = await Swal.fire({
    title: "このレシピを削除しますか",
    text: `「${recipe.name}」を削除します。元に戻せません。`,
    showCancelButton: true,
    confirmButtonText: "削除する",
    cancelButtonText: "やめる",
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: styles.getPropertyValue("--red-text").trim(),
    cancelButtonColor: styles.getPropertyValue("--blue").trim(),
  });
  if (!result.isConfirmed) return;

  deleteRecipe(recipe.id);
  location.replace("index.html");
}
