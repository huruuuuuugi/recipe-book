// 追加・編集フォーム:URL に id があれば編集、なければ追加

const form = document.getElementById("form");
const nameError = document.getElementById("name-error");
const saveError = document.getElementById("save-error");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("image-preview");
const imageRemove = document.getElementById("image-remove");
const imagePickText = document.getElementById("image-pick-text");
const imageStatus = document.getElementById("image-status");

const id = new URLSearchParams(location.search).get("id");
const editing = id ? getRecipe(id) : undefined;

// 縮小した画像(dataURL)。空ならカテゴリのイラスト
let imageData = editing ? editing.image || "" : "";
let compressing = false;

if (editing) {
  document.title = "レシピを編集 | レシピ帳";
  document.getElementById("title").textContent = "レシピを編集";
  document.getElementById("cancel").href = `detail.html?id=${encodeURIComponent(id)}`;

  form.elements.name.value = editing.name;
  form.elements.category.value = editing.category;
  form.elements.time.value = editing.time || "";
  form.elements.ingredients.value = (editing.ingredients || []).join("\n");
  form.elements.steps.value = (editing.steps || []).join("\n");
  form.elements.memo.value = editing.memo || "";
}

// プレビューを今の画像(なければ選択中カテゴリのイラスト)にする
function renderImage() {
  fillTile(imagePreview, { image: imageData, category: form.elements.category.value });
  imageRemove.hidden = !imageData;
  imagePickText.textContent = imageData ? "画像を変える" : "画像を選ぶ";
}

// 幅600px程度のJPEGに縮小して dataURL にする
async function compressImage(file) {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: 600,
    maxSizeMB: 0.1,
    fileType: "image/jpeg",
    initialQuality: 0.8,
    useWebWorker: true,
  });
  return imageCompression.getDataUrlFromFile(compressed);
}

imageInput.addEventListener("change", async () => {
  const file = imageInput.files[0];
  if (!file) return;

  compressing = true;
  imageStatus.textContent = "画像を縮小しています…";
  try {
    imageData = await compressImage(file);
    imageStatus.textContent = `縮小しました(約${Math.round((imageData.length * 3) / 4 / 1024)}KB)`;
  } catch (error) {
    console.error(error);
    imageStatus.textContent = "この画像は読み込めませんでした。別の画像を選んでください";
  } finally {
    compressing = false;
    imageInput.value = "";
    renderImage();
  }
});

imageRemove.addEventListener("click", () => {
  imageData = "";
  imageStatus.textContent = "選ばないときはカテゴリのイラストが入ります";
  renderImage();
  imageInput.focus();
});

form.elements.category.forEach((radio) => radio.addEventListener("change", renderImage));
renderImage();

// テキストエリアを改行で分けて配列にし、空の行は取り除く
function toLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  nameError.textContent = "";
  saveError.textContent = "";

  if (compressing) {
    saveError.textContent = "画像の縮小が終わるまで待ってください";
    return;
  }

  const name = form.elements.name.value.trim();
  if (!name) {
    nameError.textContent = "料理名を入力してください";
    form.elements.name.focus();
    return;
  }

  const time = Number.parseInt(form.elements.time.value, 10);
  const input = {
    name,
    category: form.elements.category.value,
    time: Number.isNaN(time) ? 0 : time,
    ingredients: toLines(form.elements.ingredients.value),
    steps: toLines(form.elements.steps.value),
    memo: form.elements.memo.value.trim(),
    image: imageData,
  };
  if (editing) {
    input.id = editing.id;
  }

  try {
    const saved = upsertRecipe(input);
    location.replace(`detail.html?id=${encodeURIComponent(saved.id)}`);
  } catch (error) {
    console.error(error);
    saveError.textContent = "保存できませんでした。容量がいっぱいかもしれません";
  }
});
