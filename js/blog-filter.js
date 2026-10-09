/**
 * NPB Guide — blog index filters
 * Search box + category chips (client-side, no external calls).
 */
(function () {
  "use strict";

  var search = document.getElementById("blogSearch");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
  var rows = Array.prototype.slice.call(document.querySelectorAll(".blog-row"));
  var empty = document.getElementById("blogEmpty");
  if (!search || !rows.length) return;

  var activeCat = "all";
  var query = "";

  function applyFilters() {
    var visible = 0;
    rows.forEach(function (row) {
      var cat = row.getAttribute("data-cat");
      var text = row.textContent.toLowerCase();
      var catOk = activeCat === "all" || cat === activeCat;
      var queryOk = !query || text.indexOf(query) !== -1;
      var show = catOk && queryOk;
      row.style.display = show ? "" : "none";
      if (show) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  search.addEventListener("input", function () {
    query = search.value.trim().toLowerCase();
    applyFilters();
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      activeCat = chip.getAttribute("data-cat");
      applyFilters();
    });
  });
})();
