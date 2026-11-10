const stack = document.getElementById("notificationStack");
let notifications = [];

function addNotification(type) {
  let message, notificationClass;

  switch (type) {
    case "error":
      message = "Something went wrong!";
      notificationClass = "notification error";
      break;
    case "warning":
      message = "Be careful!";
      notificationClass = "notification warning";
      break;
    case "success":
      message = "Operation completed";
      notificationClass = "notification success";
      break;
    default:
      message = "Notification " + Date.now().toString().slice(-4);
      notificationClass = "notification";
  }

  const notification = document.createElement("div");
  notification.className = notificationClass;

  const content = document.createElement("div");
  content.className = "notification-content";
  content.textContent = message;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "notification-delete";
  deleteBtn.innerHTML = "&times;";
  deleteBtn.addEventListener("click", () => {
    removeNotification(notification);
  });

  notification.appendChild(content);
  notification.appendChild(deleteBtn);
  stack.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");

    const autoCloseTimeout = setTimeout(() => {
      if (notifications.includes(notification)) {
        removeNotification(notification);
      }
    }, 5000);

    notification.dataset.autoCloseTimeout = autoCloseTimeout;
  }, 10);

  notifications.push(notification);

  if (notifications.length > 5) {
    const old = notifications.shift();
    removeNotification(old);
  }
}

function removeNotification(notification) {
  if (!notification || !stack.contains(notification)) return;

  if (notification.dataset.autoCloseTimeout) {
    clearTimeout(notification.dataset.autoCloseTimeout);
  }

  notification.classList.remove("show");
  notification.classList.add("fade-out");

  setTimeout(() => {
    notification.style.maxHeight = "0";
    notification.style.marginBottom = "0";
    notification.style.opacity = "0";

    setTimeout(() => {
      if (stack.contains(notification)) {
        stack.removeChild(notification);
      }

      notifications = notifications.filter((n) => n !== notification);
    }, 300);
  }, 10);
}