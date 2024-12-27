$(document).ready(function () {
  $("#header").load("../components/header.html");

  $.ajax({
    url: "/api/users",
    type: "GET",
    success: function (users) {
      const userChoices = users.user.map((user) => ({
        value: user._id,
        text: user.username,
      }));

      const surveyJSON = {
        title: "Create New Todo",
        elements: [
          {
            type: "text",
            name: "title",
            title: "Title",
            isRequired: true,
          },
          {
            type: "comment",
            name: "description",
            title: "Description",
            isRequired: true,
          },
          {
            type: "checkbox",
            name: "assignees",
            title: "Assign Users",
            choices: userChoices,
            isRequired: false,
          },
          {
            type: "checkbox",
            name: "tags",
            title: "Tags",
            choices: [],
            isRequired: false,
          },
        ],
        showQuestionNumbers: "off",
      };

      const survey = new Survey.Model(surveyJSON);

      $.ajax({
        url: `/api/todos/tags`,
        type: "GET",
        success: function (data) {
          const question = survey.getQuestionByName("tags");

          question.choices = data.map((tag) => ({
            value: tag._id,
            text: tag.name,
          }));
        },
        error: function (error) {
          console.error("Error fetching todo:", error);
        },
      });

      survey.onComplete.add(function (result) {
        const newTodoData = result.data;

        $.ajax({
          url: "/api/todos",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(newTodoData),
          success: function () {
            alert("Todo created successfully!");
            window.location.href = "/";
          },
          error: function (error) {
            console.error("Error creating todo:", error);
            alert("Failed to create todo.");
          },
        });
      });

      $("#surveyTodoForm").Survey({ model: survey });
    },
    error: function (error) {
      console.error("Error fetching users:", error);
    },
  });
});
