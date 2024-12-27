$(document).ready(function () {
  $("#header").load("../components/header.html");
  $.ajax({
    url: "/api/users/me",
    type: "GET",
    success: function (data) {
      initializeSurvey(data);
      renderTodos(data.todos);
    },
    error: function (error) {
      console.log("Error:", error);
    },
  });

  function initializeSurvey(user) {
    const surveyJSON = {
      title: "User Profile",
      elements: [
        {
          type: "text",
          name: "username",
          title: "Username",
          isRequired: true,
          defaultValue: user.username,
          enableIf: "false",
        },
        {
          type: "panel",
          title: "Change Password",
          elements: [
            {
              type: "text",
              name: "oldPassword",
              title: "Old Password",
              inputType: "password",
              isRequired: false,
            },
            {
              type: "text",
              name: "newPassword",
              title: "New Password",
              inputType: "password",
              isRequired: false,
            },
          ],
        },
      ],
      showQuestionNumbers: "off",
    };

    const survey = new Survey.Model(surveyJSON);
    survey.showCompletedPage = false;

    survey.onCompleting.add(function (sender, options) {
      const updatedData = sender.data;

      if (updatedData.newPassword && !updatedData.oldPassword) {
        alert("Lütfen eski şifrenizi giriniz.");
        options.allowComplete = false;
        return;
      }

      if (updatedData.newPassword == updatedData.oldPassword) {
        alert("Eski şifreniz ile yeni şifreniz aynı olamaz.");
        options.allowComplete = false;
      }
    });

    survey.onComplete.add(function (result) {
      const updatedData = result.data;

      if (!updatedData.newPassword) delete updatedData.newPassword;
      if (!updatedData.oldPassword) delete updatedData.oldPassword;

      $.ajax({
        url: "/api/users",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(updatedData),
        success: function () {
          alert("Profile updated successfully! Redirecting to login!");
          window.location.assign("/");
        },
        error: function (error) {
          const response = JSON.parse(error.responseText);
          alert(response.error);
          survey.clear();
        },
      });
    });

    $("#surveyProfile").Survey({ model: survey });
  }
  function renderTodos(todos) {
    if (!todos || todos.length === 0) {
      $("#todoList").append('<li class="list-group-item">No todos found.</li>');
      return;
    }

    todos.forEach((todo) => {
      $("#todoList").append(`
        <li class="list-group-item">
          <a href="/pages/detail.html?id=${todo._id}">${todo.title}</a>
          <p>${todo.description}</p>
        </li>
      `);
    });
  }
});
