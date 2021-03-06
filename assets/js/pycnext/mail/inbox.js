function readQueryParams() {
  let urlParams = new URLSearchParams(window.location.search);
  let search_by, search_val;
  if (urlParams.has("search-by")) {
    search_by = urlParams.get("search-by").toLowerCase();
  }
  if (urlParams.has("search-val")) {
    search_val = urlParams.get("search-val").toLowerCase();
  }
  let sort = urlParams.get("sort");

  if ($(location).prop("hash").substr(1).toLowerCase() === "important") {
    search_by = "useful";
  }

  options = {};
  if (search_by) {
    switch (search_by) {
      case "author":
        options["search-by"] = "sender";
        break;
      case "title":
        options["search-by"] = "subj";
        break;
      case "file":
        options["search-by"] = "att";
        break;
      case "content":
        options["search-by"] = "content";
        break;
    }
  }
  if (search_val) {
    options["search-val"] = search_val;
  }
  if (sort) {
    options["sort"] = sort;
  }
  options.sent = $(location).prop("hash").substr(1).toLowerCase() === "sent";

  /* convert search_by to camelcase */
  if (options["search-by"]) {
    $(
      ".select-items [data-value='" +
        search_by.charAt(0).toUpperCase() +
        search_by.slice(1) +
        "']"
    ).click();
  }

  return options;
}

function generateMailElement(message) {
  var mailElement = $(
    `<a href="/projects/pycnext/mail/view?id=${message.id.main}${
      options.sent ? "&ack=show" : ""
    }" class="workspace-style2 list-item-compact"></a>`
  );

  /*
  To-do: Mail checkbox

  mailElement.append(
    `<input class="mail-checkbox" type="checkbox" name="check-mail" data-message-id="${message.id.main}" data-hidden>`
  );
  */

  if (!options.sent) {
    mailElement.append(
      `<div class="workspace-style2 list-item-author">${message.author.name}</div>`
    );
  }
  mailElement.append(
    `<div class="workspace-style2 list-item-title">${message.title}</div>`
  );
  if (options.sent) {
    mailElement.append(
      `<div class="workspace-style2 list-item-desc">${message.acknowledged} / ${message.totalRecipients}</div>`
    );
  }
  let [_date, _year] = message.date.split(",");
  var timestampElement = $(
    `<div class="workspace-style2 list-item-desc timestamp"><span data-date>${_date}</span><span data-year>, ${_year}</span></div>`
  );

  /*
  To-do: Action buttons

  var actionButtons = $('<div class="mail-actions"></div>');
  actionButtons.append(
    `<button data-message-id="${message.id.main}" data-action="delete" class="message-btn message-delete-btn"><i class="fa-solid fa-trash"></i></button>`
  );
  actionButtons.append(
    `<button data-message-id="${
      message.id.main
    }" data-action="favourite" class="message-btn message-favourite-btn ${
      message.isImportant ? `fav-enabled` : `fav-disabled`
    }"><i class="fa-solid fa-star"></i></button>`
  );
  timestampElement.append(actionButtons);
  */

  mailElement.append(timestampElement);
  return mailElement;
}

const loadMessages = (pageNum) =>
  new Promise((resolve, reject) => {
    let options = readQueryParams();

    pyc.getMessages(pageNum, 0, options).then((messages) => {
      var inboxElement = $("#inbox");

      if (!JSON.parse(messages).length) {
        $("#inbox").append(
          '<div class="flex just-ctr"><div>No email found.</div></div>'
        );
        return reject();
      }

      for (const message of JSON.parse(messages)) {
        inboxElement.append(generateMailElement(message));
      }

      endOfInboxElement = $(
        `<div id="end-of-inbox" data-next-page="${Number(pageNum) + 1}"></div>`
      );
      inboxElement.append(endOfInboxElement);

      resolve();
    });
  });

function initMessageActionsBtns() {
  console.log("initializing message buttons");
  var actionButtons = $(".message-btn");
  actionButtons.each(function () {
    $(this).click(function (e) {
      e.preventDefault();
      var action = $(e.target).closest(".message-btn").attr("data-action");
      var messageId = $(e.target)
        .closest(".message-btn")
        .attr("data-message-id");
      console.log(`Action ${action} called for message #${messageId}`);
    });
  });
}

function loadNextPage() {
  if ($("#end-of-inbox").length) {
    if ($("#end-of-inbox").isInViewport()) {
      let nextPageNum = Number($("#end-of-inbox").attr("data-next-page") ?? "");
      $("#end-of-inbox").remove();
      if (!$(".loader-container").length) {
        if (isNaN(nextPageNum)) return;
        $("#inbox").append(
          '<div class="loader-container" data-padding="true"><div class="loader-ring"><div data-loader-div1></div><div data-loader-div2></div><div data-loader-div3></div><div data-loader-div4></div></div></div>'
        );
        loadMessages(nextPageNum).then(function () {
          $(".loader-container").each(function () {
            $(this).remove();
          });
          initMessageActionsBtns();
        });
      }
    }
  }
}

async function init() {
  await checklogin();

  $("#inbox-sidebar-important").click(function (e) {
    e.preventDefault();
    window.location.hash = "#important";
    location.reload();
  });
  $("#inbox-sidebar-sent").click(function (e) {
    e.preventDefault();
    window.location.hash = "#sent";
    location.reload();
  });
  $("#inbox-sidebar-home").click(function (e) {
    e.preventDefault();
    window.location.hash = "#";
    location.reload();
  });

  let urlParams = new URLSearchParams(window.location.search);
  let search_by = urlParams.get("search-by");
  let search_val = urlParams.get("search-val");

  if (
    search_by &&
    ["sender", "selected", "content", "att"].includes(search_by)
  ) {
    $("#search-options").val(search_by).change();
  }
  if (search_val) {
    $("#search-input").val(search_val).change();
  }

  let page = $(location).prop("hash").substr(1).toLowerCase();
  if (page === "important") {
    $("#inbox-sidebar-important").addClass("active-inbox-section");
    $("#search-options").css("display", "none");
    $("#search-bar .vl").css("display", "none");
    $("#search-input-container").css({ margin: "0.5em 1em", flex: "1" });
  } else if (page === "sent") {
    $("#inbox-sidebar-sent").addClass("active-inbox-section");
    $("#search-bar").remove();
  } else {
    $("#inbox-sidebar-home").addClass("active-inbox-section");
  }

  loadMessages(0).then(
    function () {
      $(".loader-container").each(function () {
        $(this).remove();
      });
      initMessageActionsBtns();
      loadNextPage();
    },
    function () {
      $(".loader-container").each(function () {
        $(this).remove();
      });
    }
  );

  $("#inbox").on("resize scroll", loadNextPage);
}

window.onload = init;
