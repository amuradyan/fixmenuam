function isEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

//////////////////////// Init code
(function init() {
  chrome.windows.getAll({ 'populate': true }, function (windows) {
    for (var i = 0; i < windows.length; i++) {
      const tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        if (tabs[j].url.startsWith('https://www.menu.am/')) {
          chrome.tabs.executeScript(
            tabs[j].id, { file: './build/content.js', allFrames: true });
        }
      }
    }
  });
})();
