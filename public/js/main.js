document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendMessage");
  const chatMessages = document.getElementById("chatMessages");
  const loadingDiv = document.getElementById("loading");
  const errorDiv = document.getElementById("error");

  let currentFileId = null;

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      showError("No file selected");
      return;
    }

    try {
      showLoading();
      const formData = new FormData();
      formData.append("pdfFile", file);

      const response = await fetch(`${window.API_URL}files/query-with-pdf`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      currentFileId = data.fileId;
      addSystemMessage(
        "PDF processed successfully. You can now ask questions about the document."
      );
    } catch (error) {
      showError("Failed to upload file. Please try again.");
      console.error("Upload error:", error);
    } finally {
      hideLoading();
    }
    messageHistory = []; // Clear message history for new file
    chatMessages.innerHTML = ""; // Clear chat display
  };

  // Add this at the top with other state variables
  let messageHistory = [];

  const sendMessage = async () => {
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to history
    messageHistory.push({
      role: "user",
      content: message,
    });

    addUserMessage(message);
    messageInput.value = "";

    try {
      showLoading();
      const response = await fetch(`${window.API_URL}rag/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messageHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Add assistant's response to history
      messageHistory.push({
        role: "assistant",
        content: data,
      });

      addAssistantMessage(data);
    } catch (error) {
      showError("Failed to get response. Please try again.");
      console.error("Chat error:", error);
    } finally {
      hideLoading();
    }
  };

  function addMessage(content, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `p-3 rounded-lg ${
      type === "user"
        ? "bg-blue-100 ml-auto"
        : type === "assistant"
        ? "bg-gray-100"
        : "bg-yellow-100"
    } max-w-[80%]`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addUserMessage(content) {
    addMessage(content, "user");
  }

  function addAssistantMessage(content) {
    addMessage(content, "assistant");
  }

  function addSystemMessage(content) {
    addMessage(content, "system");
  }

  function showLoading() {
    loadingDiv.classList.remove("hidden");
    sendButton.disabled = true;
  }

  function hideLoading() {
    loadingDiv.classList.add("hidden");
    sendButton.disabled = false;
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
    setTimeout(() => {
      errorDiv.classList.add("hidden");
    }, 3000);
  }

  fileInput.addEventListener("change", handleFileUpload);
  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});
