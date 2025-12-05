console.log("✅ script.js loaded!");

document.getElementById("contactForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevents page reload

    console.log("📌 Submit button clicked!");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;
    const responseMessage = document.getElementById("responseMessage");
    const sendButton = document.getElementById("sendButton");

    // Show "Sending..." message & disable button
    responseMessage.style.color = "orange";
    responseMessage.textContent = "Sending...";
    sendButton.disabled = true;
    sendButton.style.backgroundColor = "gray"; 

    try {
        const res = await fetch("http://localhost:5000/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
        });

        const data = await res.json();

        if (data.success) {
            console.log("✅ Message sent successfully!");
            responseMessage.style.color = "cyan"; 
            responseMessage.textContent = "Message sent successfully!";
            document.getElementById("contactForm").reset();
        } else {
            console.log("❌ Failed to send message.");
            responseMessage.style.color = "red";
            responseMessage.textContent = "Failed to send message.";
        }
    } catch (error) {
        console.error("❌ Error:", error);
        responseMessage.style.color = "red";
        responseMessage.textContent = "Error connecting to the server.";
    }

    // Re-enable button after message is sent
    sendButton.disabled = false;
    sendButton.style.backgroundColor = "#007BFF"; 
});
