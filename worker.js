const STREAMTAPEDOMAINS = ["streamtape.com", "streamtape.to"];

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;

  const checkRegex = new RegExp(
    `https:\/\/(${STREAMTAPEDOMAINS.join("|")})\/v\/`,
    "i"
  );

  // check if url starts with the regex match
  if (!checkRegex.test(changeInfo.url)) return;
  if (!changeInfo.url.startsWith("https://streamtape")) return;

  console.log(`Getting download link for ${changeInfo.url}`);

  chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL("player.html") + "?url=" + changeInfo.url,
  });
});
