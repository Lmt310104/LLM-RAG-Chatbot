document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput"); // Đổi từ textarea thành input file
  const submitButton = document.getElementById("submit");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");
  const resultContent = document.getElementById("resultContent");
  const errorDiv = document.getElementById("error");

  submitButton.addEventListener("click", async () => {
    const file = fileInput.files[0]; // Lấy file từ input
    if (!file) {
      showError("Please select a PDF file to upload.");
      return;
    }

    try {
      showLoading();
      const formData = new FormData();
      formData.append("pdfFile", file); // Backend nhận key "file"

      const response = await fetch(`${window.API_URL}rag/query-with-pdf`, {
        method: "POST",
        body: formData, // Không cần headers "Content-Type"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      showResult(data.answer);
    } catch (error) {
      showError("Failed to process PDF. Please try again.");
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
