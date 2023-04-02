window.addEventListener("load", async () => {
  console.log("Loaded");

  const loading = document.getElementById("loading");
  const loaded = document.getElementById("loaded");
  const error = document.getElementById("error");

  const video = document.getElementById("video");
  const size = document.getElementById("size");
  const resolution = document.getElementById("resolution");
  const duration = document.getElementById("duration");
  const errorMsg = document.getElementById("errorMsg");
  const title = document.getElementById("title");

  const downloadButton = document.getElementById("downloadButton");
  const copyButton = document.getElementById("copyButton");
  const reloadButton = document.getElementById("reloadButton");

  reloadButton.addEventListener("click", () => {
    window.location.reload();
  });

  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url");

  if (!url) showError("URL not found");

  const getData = await getUrl(url);

  if (!getData.success) {
    showError(getData.error);
  } else {
    loading.classList.remove("flex");
    loading.classList.add("hidden");

    loaded.classList.remove("hidden");
    loaded.classList.add("flex");

    video.src = getData.playUrl;
    video.poster = getData.poster;
    size.innerText = getData.size;
    title.innerText = getData.title;

    video.addEventListener("loadedmetadata", () => {
      resolution.innerText = video.videoWidth + "x" + video.videoHeight;
      duration.innerText = video.duration + "s";
    });

    downloadButton.addEventListener("click", () => {
      window.open(getData.url, "_blank");
    });

    copyButton.addEventListener("click", () => {
      navigator.clipboard.writeText(getData.url);
      alert("Copied to clipboard");
    });
  }

  function showError(msg) {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
    error.classList.add("flex");
    errorMsg.innerText = msg;
  }
});

async function getUrl(url = "") {
  try {
    const parsedUrl = new URL(url);

    const response = await fetch(parsedUrl.href);

    const html = await response.text();

    const urlRegex =
      /document\.getElementById\('norobotlink'\)\.innerHTML = (.*);/;
    const urlMatch = html.match(urlRegex);
    if (!urlMatch) throw new Error("norobotlink url not found");

    const tokenRegex = /token=([^&']+)/;
    const tokenMatch = urlMatch[1].match(tokenRegex);
    if (!tokenMatch) throw new Error("token not found");

    // <div id="ideoooolink" style="display:none;">take all</div>
    const fullUrlRegex =
      /<div id="ideoooolink" style="display:none;">(.*)<[/]div>/;
    const fullUrlMatch = html.match(fullUrlRegex);
    if (!fullUrlMatch) throw new Error("ideoooolink url not found");

    let finalUrl = fullUrlMatch[1].split(parsedUrl.hostname)[1];
    finalUrl = `https://${parsedUrl.hostname}${finalUrl}&token=${tokenMatch[1]}`;

    const sizeRegex = /<p class="subheading">(.*)<[/]p>/;
    const sizeMatch = html.match(sizeRegex);

    const titleRegex = /<meta name="og:title" content="(.*)">/;
    const titleMatch = html.match(titleRegex);

    const posterRegex = /<meta name="og:image" content="(.*)">/;
    const posterMatch = html.match(posterRegex);

    return {
      success: true,
      url: finalUrl + "&dl=1",
      playUrl: finalUrl,
      size: sizeMatch ? sizeMatch[1] : "Unknown",
      title: titleMatch ? fixTitle(titleMatch[1]) : "Streamtape Extension",
      poster: posterMatch ? posterMatch[1] : "",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function fixTitle(str = "") {
  let all = str.split(".");
  return all[0];
}
