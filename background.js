// enabled[tab.id] = true|false
var enabled = {};

// addedContentScript[tab.id] = true|false
var addedContentScript = {};

var contextMenuId;

chrome.browserAction.setBadgeBackgroundColor({
    color: [0, 255, 0, 127]
});

function toggleStarRules(tabId) {
    var enabledStarRulesForTab = enabled[tabId];
    var addedCScriptForTab = addedContentScript[tabId];
    if (!addedCScriptForTab) {
        // add CS for tab and toggle in its callback
        chrome.tabs.executeScript(tabId, {
            file     : "content_script.js",
            allFrames: true
        }, function () {
            addedContentScript[tabId] = true;
            _toggleStarRules(tabId, true);
        });
    } else {
        _toggleStarRules(tabId, !enabledStarRulesForTab);
    }
}

function _toggleStarRules(tabId, /*Boolean*/ setStarRules) {
    chrome.tabs.sendRequest(tabId, {
            action: "toggleStarRule",
            value : setStarRules
        }, function (/*Boolean*/ response) {
            var isStarRulesSet = response.value;
            if (undefined != isStarRulesSet) {
                // update state
                enabled[tabId] = isStarRulesSet;

                // update browserAction text
                chrome.browserAction.setBadgeText({
                    text : isStarRulesSet ? "On" : "",
                    tabId: tabId
                });

                // toggle contextMenu checkbox
                chrome.contextMenus.update(contextMenuId, {
                    checked: isStarRulesSet
                });
            } else {
                // Request failed
                throw "sendRequest to tab failed";
            }
        }
    );
}

function contextMenuListener(info, tab) {
    toggleStarRules(tab.id);
    _gaq.push(["_trackEvent", "toggled", "contextMenu"]);
}

function browserActionListener(tab) {
    toggleStarRules(tab.id);
    _gaq.push(["_trackEvent", "toggled", "browserAction"]);
}

chrome.browserAction.onClicked.addListener(browserActionListener);

contextMenuId = chrome.contextMenus.create({
    type    : "checkbox",
    title   : "Enable CSS transition on '*' selector",
    contexts: ["page"],
    checked : false,
    onclick : contextMenuListener
});

chrome.tabs.onActiveChanged.addListener(function (tabId, selectInfo) {
    // Update contextMenu checked status and browserAction
    chrome.contextMenus.update(contextMenuId, {
        checked: !!enabled[tabId]
    });
});