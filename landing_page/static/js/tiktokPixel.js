// tiktokPixel.js

// TikTok Pixel Scripts Code
(function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = w[t] = w[t] || [];
  ttq.methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent"
  ];
  ttq.setAndDefer = function (t, e) {
    t[e] = function () {
      t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (var i = 0; i < ttq.methods.length; i++) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }
  ttq.instance = function (t) {
    var e = ttq._i[t] || [];
    for (var n = 0; n < ttq.methods.length; n++) {
      ttq.setAndDefer(e, ttq.methods[n]);
    }
    return e;
  };
  ttq.load = function (e, n) {
    var r = "https://analytics.tiktok.com/i18n/pixel/events.js",
      o = n && n.partner;
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};
    var a = document.createElement("script");
    a.type = "text/javascript";
    a.async = true;
    a.src = r + "?sdkid=" + e + "&lib=" + t;
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(a, s);
  };

  ttq.load("CU4HDPBC77UAI9RJ1GL0");
  ttq.page();
})(window, document, "ttq");

// Track ViewContent event
ttq.track("ViewContent", {
  contents: [
    {
      content_id: "reconnect_course_v2",
      content_type: "product",
      content_name: "Reconnect V2 Course"
    }
  ],
  value: 0,
  currency: "USD"
});

// Add event listeners for the buy button
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".buy-button").forEach(function (button) {
    button.addEventListener("click", function () {
      // Track AddToCart in TikTok browser pixel
      ttq.track("AddToCart", {
        contents: [
          {
            content_id: "reconnect_course_v2",
            content_type: "product",
            content_name: "Reconnect V2 Course"
          }
        ],
        value: 377,
        currency: "RON"
      });

      // Trigger server-side AddToCart event
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

      fetch("/add-to-cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrfToken
        },
        body: new URLSearchParams({
          email: "user@example.com" // Replace with dynamic user email
        })
      })
        .then((response) => response.json())
        .then((data) => console.log("Server event response:", data))
        .catch((error) => console.error("Error:", error));
    });
  });
});
