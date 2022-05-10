function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

$.fn.isInViewport = function () {
  var elementTop = $(this).offset().top;
  var elementBottom = elementTop + $(this).outerHeight();

  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();

  return elementBottom > viewportTop && elementTop < viewportBottom;
};

function pyc_alert(content) {
  let alert_element = $("body").prepend(
    `<div class="alert-box">${content}</div>`
  )[0];
  setTimeout(() => {
    $(".alert-box").each(function () {
      $(this).remove();
    });
  }, 5000);
}

checklogin = () =>
  new Promise((resolve, reject) => {
    if (pyc == null) {
      if (getCookie("PHPSESSID") != null && getCookie("access_token") != null) {
        pyc = new PycClient();
        return resolve(true);
      }
      return resolve(false);
    }
    return resolve(true);
  });

function updateURLParameter(url, param, paramVal) {
  var TheAnchor = null;
  var newAdditionalURL = "";
  var tempArray = url.split("?");
  var baseURL = tempArray[0];
  var additionalURL = tempArray[1];
  var temp = "";

  if (additionalURL) {
    var tmpAnchor = additionalURL.split("#");
    var TheParams = tmpAnchor[0];
    TheAnchor = tmpAnchor[1];
    if (TheAnchor) additionalURL = TheParams;

    tempArray = additionalURL.split("&");

    for (var i = 0; i < tempArray.length; i++) {
      if (tempArray[i].split("=")[0] != param) {
        newAdditionalURL += temp + tempArray[i];
        temp = "&";
      }
    }
  } else {
    var tmpAnchor = baseURL.split("#");
    var TheParams = tmpAnchor[0];
    TheAnchor = tmpAnchor[1];

    if (TheParams) baseURL = TheParams;
  }

  if (TheAnchor) paramVal += "#" + TheAnchor;

  var rows_txt = temp + "" + param + "=" + paramVal;
  return baseURL + "?" + newAdditionalURL + rows_txt;
}

/** */

let subpage_match =
  /(?:https?:\/\/)?(?:(?:localhost(?::4000)?)|(?:kai9073\.github\.io))(?:\/projects)?\/pyc\/([^/?#]+)/.exec(
    window.location.href
  );
let subpage = subpage_match[1].toLowerCase();
console.log(subpage);
subpage = subpage === "home" ? "message" : subpage;
let sidebar_page_item = $(`#sidebar-${subpage}`);
if (sidebar_page_item.length) {
  sidebar_page_item.addClass("active-page");
}