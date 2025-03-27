document.addEventListener("DOMContentLoaded", () => {
  const queryInput = document.getElementById("query");
  const submitButton = document.getElementById("submit");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");
  const resultContent = document.getElementById("resultContent");
  const errorDiv = document.getElementById("error");

  submitButton.addEventListener("click", async () => {
    const query = queryInput.value.trim();
    if (!query) {
      showError("Please enter a response to evaluate");
      return;
    }

    try {
      showLoading();
      const response = await fetch(
        `${process.env.API_URL}rag/evaluate-result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ result: query }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      showResult(data.result);
    } catch (error) {
      showError("Failed to evaluate response. Please try again.");
      console.error("Error:", error);
    } finally {
      hideLoading();
    }
  });

  function showLoading() {
    loadingDiv.classList.remove("hidden");
    resultDiv.classList.add("hidden");
    errorDiv.classList.add("hidden");
    submitButton.disabled = true;
  }

  function hideLoading() {
    loadingDiv.classList.add("hidden");
    submitButton.disabled = false;
  }

  function showResult(result) {
    resultContent.textContent = result;
    resultDiv.classList.remove("hidden");
    errorDiv.classList.add("hidden");
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
    resultDiv.classList.add("hidden");
  }
});
