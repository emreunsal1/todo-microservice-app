document.addEventListener("DOMContentLoaded", function () {
  const loginForm = {
    title: "Login",
    elements: [
      {
        name: "username",
        title: "Enter your user name:",
        type: "text",
        required: true,
      },
      {
        name: "password",
        title: "Enter your password:",
        type: "text",
        inputType: "password",
        required: true,
      },
      {
        name: "checkPassword",
        title: "Enter your password again:",
        type: "text",
        inputType: "password",
        required: true,
      },
      {
        type: "html",
        name: "registerLink",
        html: '<a href="/pages/login.html" id="goToRegister">Have an account alread? Login here</a>',
      },
    ],
  };

  const registerSurvey = new Survey.Model(loginForm);
  registerSurvey.showCompletedPage = false;

  registerSurvey.onValidateQuestion.add((survey, options) => {
    if (options.value.length < 3) {
      options.error = `${options.name} must contain min 3 chars`;
    }

    if (options.name === "checkPassword") {
      const passwordValue = survey.data["password"];
      if (options.value !== passwordValue) {
        options.error = "Passwords do not match!";
      }
    }
  });

  registerSurvey.onComplete.add(async (sender) => {
    const formData = sender.data;
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Login successful!");
        window.location.href = "/";
      } else {
        const error = await response.json();
        registerSurvey.clear();

        const emailQuestion = sender.getQuestionByName("newPassword");
        if (!emailQuestion.value || !emailQuestion.value.includes("@")) {
          emailQuestion.addError("Please enter a valid email address.");
          hasErrors = true;
        }
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  });

  registerSurvey.render(document.getElementById("surveyContainer"));
});
