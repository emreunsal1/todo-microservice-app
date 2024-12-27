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
        type: "html",
        name: "registerLink",
        html: '<a href="/pages/register.html" id="goToRegister">Don’t have an account? Register here</a>',
      },
    ],
    completedHtml: "<h4>You have successfully logged in!</h4>",
  };

  const loginSurvey = new Survey.Model(loginForm);
  loginSurvey.showCompletedPage = false;

  loginSurvey.onValidateQuestion.add((survey, options) => {
    if (options.value.length < 3) {
      options.error = `${options.name} must contain min 3 chars`;
    }
  });

  loginSurvey.onComplete.add(async (sender) => {
    const formData = sender.data;
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Login successful!");
        window.location.href = "/";
      } else {
        const error = await response.json();
        loginSurvey.clear();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  });

  loginSurvey.render(document.getElementById("surveyContainer"));
});
