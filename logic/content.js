var basket;

document.addEventListener('b', function(e) {
  basket = e.detail
  console.log(e.detail)
});

var s = document.createElement('script');
s.id = 'injected'
s.src = chrome.runtime.getURL('resources/script.js');

(document.head || document.documentElement).appendChild(s);

if (window.location.href.indexOf('status') < 0) {
  if(window.location.href.indexOf('?') > 0) {
    window.location.replace(window.location.href + '&status=open')
  } else {
    window.location.replace(window.location.href + '?status=open')
  }
}
