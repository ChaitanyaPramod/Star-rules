styleElement = document.createElement("style");
styleElement.type = "text/css";
styleElement.id = "star-rule-style";
styleElement.disabled = true;
styleElement.innerText = "* {-webkit-transition: all 0.3s ease;}";
document.head.appendChild(styleElement);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request && request.action == "toggleStarRule") {
        styleElement.disabled = !request.value;
        sendResponse(request);
    }
});