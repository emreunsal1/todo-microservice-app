$("#createTodoButton").click(function () {
  window.location.pathname = "../pages/createTodo.html";
});

$("#logoutButton").click(function () {
  $.ajax({
    url: `/api/auth/logout`,
    type: "POST",
    success: function (data) {
      window.location.assign("/");
    },
    error: function (error) {
      console.log("Error:", error);
    },
  });
});
