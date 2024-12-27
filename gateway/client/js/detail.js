$(document).ready(function () {
  $("#header").load("../components/header.html");
  let searchParams = new URLSearchParams(window.location.search);
  const todoId = searchParams.get("id");

  $.ajax({
    url: `/api/todos/detail/?todoId=${todoId}`,
    type: "GET",
    success: function (data) {
      renderTodoDetails(data);
      initializeSurvey(data);
    },
    error: function (error) {
      console.error("Error fetching todo:", error);
    },
  });

  function renderTodoDetails(todo) {
    $("#todoTitle").text(todo.title);
    $("#todoDescription").text(todo.description);
    $("#todoAssignees").html(
      todo.assignees.map((user) => user.username).join(", ")
    );
    $("#todoTags").html(todo.tags.map((tag) => tag.name).join(", "));
  }

  function initializeSurvey(todo) {
    $.ajax({
      url: "/api/users",
      type: "GET",
      success: function (users) {
        const userChoices = users.user.map((user) => ({
          value: user._id,
          text: user.username,
        }));

        const surveyJSON = {
          title: "Update Todo",
          elements: [
            {
              type: "text",
              name: "title",
              title: "Title",
              defaultValue: todo.title,
              isRequired: true,
            },
            {
              type: "comment",
              name: "description",
              title: "Description",
              defaultValue: todo.description,
              isRequired: true,
            },
            {
              type: "checkbox",
              name: "assignees",
              title: "Assignees",
              defaultValue: todo.assignees.map((a) => a._id),
              choices: userChoices,
              isRequired: false,
            },
            {
              type: "checkbox",
              name: "tags",
              title: "Tags",
              defaultValue: todo.tags.map((a) => a._id),
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
          const updatedData = result.data;

          $.ajax({
            url: `/api/todos/?todoId=${todoId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedData),
            success: function () {
              alert("Todo updated successfully!");
              window.location.reload();
            },
            error: function (error) {
              console.error("Error updating todo:", error);
              alert("Failed to update todo.");
              window.location.reload();
            },
          });
        });

        $("#surveyTodoForm").Survey({ model: survey });
      },
      error: function (error) {
        console.error("Error fetching users:", error);
      },
    });
  }
});
