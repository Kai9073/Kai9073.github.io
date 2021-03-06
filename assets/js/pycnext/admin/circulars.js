const loadCirculars = (pageNum) =>
  new Promise((resolve, reject) => {
    pyc.getCirculars(pageNum, 0).then((circulars) => {
      var container = $("#circulars-list");

      if (!circulars.length) {
        container.append(
          '<div class="flex just-ctr"><div>Failed to retrieve circulars.</div></div>'
        );
        return reject();
      }

      for (const circular of circulars) {
        var circularListItem = $(
          `<a href="/projects/pycnext/admin/circulars?id=${circular.id}" class="workspace-style2 list-item-compact"></a>`
        );
        let subjectElement = `<div class="workspace-style2 list-item-title">${circular.subject}</div>`;
        let [_date, _year] = circular.date.split(",");
        var timestampElement = `<div class="workspace-style2 list-item-desc timestamp">
                                <span data-date>${_date}</span><span data-year></span>, ${_year}</span>
                                </div>`;

        circularListItem.append(subjectElement);
        circularListItem.append(timestampElement);
        container.append(circularListItem);
      }

      endOfListElement = $(
        `<div id="end-of-list" data-next-page="${Number(pageNum) + 1}"></div>`
      );
      container.append(endOfListElement);
      resolve();
    });
  });

const loadCircular = (id) =>
  new Promise((resolve, reject) => {
    $("#search-bar + hr").remove();
    $("#search-bar").remove();

    $("#circular-buttons-row + hr").remove();
    $("#circular-buttons-row").remove();

    pyc.getCircular(id, 0).then((circular) => {
      $("#circulars-list").attr("id", "circular-container");
      $("#circular-container").addClass("relative");
      $("#circular-container").html(
        `
        <div class="shadow"></div>
        <div id="circular-header" class="workspace-style2 header">
          <div id="circular-title" class="flex align-ctr">
            <a href="/projects/pycnext/admin/circulars" class="workspace-style2 button">
                <i class="fa-solid fa-angle-left"></i>
            </a>
            <div id="circular-subject">
            ${circular.subject}
            <span id="m-circular-date">${circular.date}</div>
            </div>
          </div>
          <div id="circular-date">${circular.date}</div>
        </div>
        <div
          id="circular-description"
          class="flex workspace-style2 contents m-flex-col"
        >
        ${
          !circular.description.length
            ? ""
            : `
                <div id="circular-description-text">
                  <span>${circular.description}</span>
                  <div class="expander">
                    <i class="fa-solid fa-chevron-down"></i>
                  </div>
                </div>
            `
        }
        </div>
        `
      );
      $("#circular-description").prepend(`
      <div id="circular-view"></div>
      `);
      $("#circular-description").css("position", "relative");
      $("#circular-description-text").css("margin", "1em");
      let view_width = $("#circular-view").width();
      if (window.matchMedia("(max-width: 748px)").matches) {
        $("#circular-view").css("flex", `0 0 ${view_width * 1.4142}px`);
      } else {
        $("#circular-view").height(`${view_width * 1.4142}px`);
      }
      $(window).on("resize", function () {
        let view_width = $("#circular-view").width();
        if (window.matchMedia("(max-width: 748px)").matches) {
          $("#circular-view").css("flex", `0 0 ${view_width * 1.4142}px`);
        } else {
          $("#circular-view").height(`${view_width * 1.4142}px`);
        }
      });
      var adobeDCView = new AdobeDC.View({
        clientId: ADOBE_S,
        divId: "circular-view",
      });
      adobeDCView.previewFile(
        {
          content: {
            location: {
              url: `https://PYCNextAPI.ookai9097oo.repl.co/amazonaws/circular/${encodeURIComponent(
                circular.url.split("circulars/")[1]
              )}`,
            },
          },
          metaData: { fileName: `Circular ${id}.pdf` },
        },
        { showLeftHandPanel: false, showPageControls: false }
      );
      resolve();
    });
  });

function loadNextPage() {
  if ($("#end-of-list").length) {
    if ($("#end-of-list").isInViewport()) {
      let nextPageNum = Number($("#end-of-list").attr("data-next-page") ?? "");
      $("#end-of-list").remove();
      if (!$(".loader-container").length) {
        console.log($("#end-of-list").attr("data-next-page"));
        if (isNaN(nextPageNum)) return;
        $("#circulars-list").append(
          '<div class="loader-container" data-padding="true"><div class="loader-ring"><div data-loader-div1></div><div data-loader-div2></div><div data-loader-div3></div><div data-loader-div4></div></div></div>'
        );
        console.log(nextPageNum);
        loadCirculars(nextPageNum).then(function () {
          $(".loader-container").each(function () {
            $(this).remove();
          });
        });
      }
    }
  }
}

async function init() {
  await checklogin();

  let param = new URL(document.location).searchParams;
  let id = param.get("id");

  if (/[0-9]{1,6}/.test(id)) {
    loadCircular(id).then((circular) => {});
  } else {
    loadCirculars(0).then(
      function () {
        $(".loader-container").each(function () {
          $(this).remove();
        });
        loadNextPage();
      },
      function () {
        $(".loader-container").each(function () {
          $(this).remove();
        });
      }
    );
  }

  $("#circulars-list").on("resize scroll", loadNextPage);
}

window.onload = init;
