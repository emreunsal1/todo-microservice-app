$(document).ready(function () {
  $("#header").load("./components/header.html");

  $("#todoTable").DataTable({
    ajax: {
      url: "/api/todos",
      method: "GET",
      dataSrc: "",
      error: function (xhr, error, thrown) {
        console.error("AJAX error: ", thrown);
      },
    },
    processing: true,
    columns: [
      { data: "title" },
      { data: "description" },
      {
        data: "tags",
        render: function (data) {
          return data.map((tag) => tag.name);
        },
      },
      {
        data: "assignees",
        render: function (data) {
          return data.map((user) => user.username);
        },
      },
      {
        data: "_id",
        render: function (data) {
          return `
            <button class="btn btn-primary btn-sm edit-btn" data-id="${data}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${data}">Delete</button>
          `;
        },
      },
    ],
  });

  $("#todoTable").on("click", ".edit-btn", function () {
    const id = $(this).data("id");
    window.location.href = `./pages/detail.html?id=${id}`;
  });

  $("#my-assigned-button").on("click", function () {
    const assignedButtonTexts = {
      SELECTED: "Show All TODO's",
      UNSELECTED: "Show My Assigned TODO's",
    };

    $(this).toggleClass("btn-outline-primary btn-primary");

    const currentText = $(this).text();
    const isShowAllTodosSelected = currentText === assignedButtonTexts.SELECTED;

    const newText = isShowAllTodosSelected
      ? assignedButtonTexts.UNSELECTED
      : assignedButtonTexts.SELECTED;

    if (isShowAllTodosSelected) {
      $("#todoTable").DataTable().ajax.url("/api/todos").load();
    }
    if (!isShowAllTodosSelected) {
      $("#todoTable")
        .DataTable()
        .ajax.url("/api/todos?assignedToMe=true")
        .load();
    }
    $(this).text(newText);
  });

  $("#todoTable").on("click", ".delete-btn", function () {
    const id = $(this).data("id");
    $.ajax({
      url: `/api/todos/${id}`,
      type: "DELETE",
      success: function (data) {},
      error: function (error) {
        console.log("Error:", error);
      },
    });
  });

  const socket = io();

  socket.on("UPDATED", () => {
    $("#todoTable").DataTable().ajax.reload();
  });
});
