const puppeteer = require("puppeteer");
// const Downloader = require("filedownloader");
const download = require("download-file");
const fs = require("fs");
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");

const screen = {
  width: 640,
  height: 480
};
var isLoggedIn = false;
var sessionStatus = false;
var isLoading = true;

const port = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "/example/test.html");

/*
|=================================================================
|   +  constants to be set each time Vampire is teased --
|=================================================================
|      1-   mobile_number
|      2-   type
|      3-   caption (if required)
|=================================================================
*/
var mobile_number;
var type;
var caption;

/*
|=================================================================
|   +  Initialize socket here --
|=================================================================
*/
const server = express()
  .use(express.static(path.join(__dirname, "example")))
  .get("/", (req, res) => res.sendFile(INDEX))
  .listen(port, () => console.log(`VampireWhatsApp listening on port ${port}`));

const io = socketIO(server);
io.on("connection", socket => {
  /*
    |-------------------------------------------------------------
    |   ~  event to send text message
    |-------------------------------------------------------------
    */
  socket.on("send_text_message", msg => {
    if (isLoggedIn && sessionStatus) {
      message = msg.message;
      type = "text";
      mobile_number = msg.mobile_number;
      decisionMaker(type, message, mobile_number);
    }
  });

  socket.on("restart_session", () => {
    process.exit(0);
  });

  socket.on("check_session", () => {
    if (!isLoading) {
      if (page) {
        io.emit("session_status", true);
      } else {
        io.emit("session_status", err);
      }
    }
  });

  /*
    |-------------------------------------------------------------
    |   ~  event to send files
    |-------------------------------------------------------------
    */
  socket.on("send_file_message", msg => {
    if (isLoggedIn && sessionStatus) {
      message = msg.file_link;
      type = msg.type;
      mobile_number = msg.mobile_number;
      caption = msg.caption;
      decisionMaker(type, message, mobile_number);
    }
  });

  socket.on("get_QR_code", () => {
    if (sessionStatus) {
      getQRCode(data => {
        io.emit("get_QR_code_response", data);
      });
    }
  });

  socket.on("get_login_status", () => {
    if (sessionStatus) {
      io.emit("is_logged_in_response", isLoggedIn);
    }
  });

  /*
    |-------------------------------------------------------------
    |   ~  event to get all unread messages
    |-------------------------------------------------------------
    */
  socket.on("get_unread_replies", () => {
    if (isLoggedIn && sessionStatus) {
      getUnreadReplies(data => {
        io.emit("get_unread_response", data);
      });
    } else {
      io.emit("get_unread_response", []);
    }
  });

  /*
    |-------------------------------------------------------------
    |   ~  to send seen reply to unseen message
    |-------------------------------------------------------------
    */
  socket.on("send_seen_reply", msg => {
    if (sessionStatus) {
      sendSeenNotification(msg);
    }
  });
});
let browser;
let page;
(async () => {
  browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });
  isLoading = false;
  sessionStatus = true;
  page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"
  );
  await page.goto("https://web.whatsapp.com");
  await page.waitFor(2000);
  await page.evaluate(
    `window.getQRcodesrc = function(done) {
            var reload_icon = document.getElementsByClassName('_1MOym')[0];
            if(reload_icon)
                reload_icon.click();
            if(document.getElementsByClassName('_1pw2F')[0]){
                var src = document.getElementsByTagName('img')[0].src;
                return src;
            } else {
                return false;
            }
        }`
  );
  executeWAPIPuppeter();
})();

console.log("Welcome To Vampire WhatsApp");
/*
    |-------------------------------------------------------------
    |   ~  injecting automation code to browser console
    |-------------------------------------------------------------
    */

function trackLoginPuppeter() {
  const css_selector = "._3FB_S";
  page
    .waitForSelector(css_selector)
    .then(el => {
      isLoggedIn = false;
      console.log("logged out");
      executeWAPIPuppeter();
    })
    .catch(err => {
      trackLoginPuppeter();
    });
}

function executeWAPIPuppeter() {
  const css_selector = "._3RWII";
  page
    .waitForSelector(css_selector)
    .then(el => {
      fs.open("./assets/whatsapp.js", "r", function(err, fileToRead) {
        page.reload().then(() => {
          page.waitFor(3000).then(() => {
            fs.readFile(
              fileToRead,
              {
                encoding: "utf-8"
              },
              (err, data) => {
                var scriptToEcecute = data;
                page
                  .evaluate(scriptToEcecute)
                  .then(() => {
                    isLoggedIn = true;
                    console.log("logged in");
                    getUnreadReplies(data => {
                      io.emit("get_unread_response", data);
                    });
                    trackLoginPuppeter();
                  })
                  .catch(e => {
                    page.waitFor(3000).then(() => {
                      executeWAPIPuppeter();
                    });
                  });
              }
            );
          });
        });
      });
    })
    .catch(err => {
      executeWAPIPuppeter();
    });
}

function getQRCode(done) {
  if (!isLoggedIn) {
    var scriptToGetQRcode = "window.getQRcodesrc()";
    page
      .evaluate(scriptToGetQRcode)
      .then(data => {
        done(data);
      })
      .catch(err => {});
  } else {
    done(false);
  }
}

/*
|=================================================================
|   +  Deciding the function call based on text or file message
|=================================================================
*/
function decisionMaker(type, message, mobile_number) {
  if (type === "text") sendText(message, mobile_number);
  else sendFile(message, mobile_number, type);
}

/*
|=================================================================
|   +  Sending text message
|=================================================================
*/
function sendText(message, mobile_number) {
  var scriptToSendText =
    "window.WAPI.sendMessageToID('" +
    mobile_number +
    "@c.us', '" +
    message.replaceAll("BREAK_LINE", "\\n") +
    "',function(data){console.log(data)})";
  page.evaluate(scriptToSendText);
  console.log(scriptToSendText);
}

/*
|=================================================================
|   +  Sending file message -- requires various function call
|=================================================================
*/
function sendFile(fileLink) {
  downloadFile(fileLink);
}
/*
|-----------------------------------------------------------------
|   ~  Download file from link given -- link with file's extension
|-----------------------------------------------------------------
*/
function downloadFile(fileLink) {
  var base64enc;
  var fileUrl = fileLink;
  var fileSavePath = __dirname + "/files/";
  var option = {
    directory: fileSavePath
  };
  download(fileUrl, option, err => {
    if (err) console.log(err);
    else base64enc = base64_encode(fileLink, type, mobile_number);
  });
}

/*
|-----------------------------------------------------------------
|   ~  Base64 conversion function
|-----------------------------------------------------------------
*/
function base64_encode(fileLink) {
  var file_name = fileLink.substring(fileLink.lastIndexOf("/") + 1);
  var bitmap = fs.readFileSync("./files/" + file_name);
  var buf_base64 = new Buffer(bitmap).toString("base64");
  send_file(buf_base64, file_name);
}

/*
|-----------------------------------------------------------------
|   ~  Trigger send file on browser console with base64 encode
|-----------------------------------------------------------------
*/
function send_file(buf_base64, file_name) {
  var scriptToSendText =
    "window.WAPI.sendImage('data:" +
    type +
    ";base64," +
    buf_base64 +
    "', '" +
    mobile_number +
    "@c.us', '" +
    file_name +
    "', '" +
    caption.replaceAll("BREAK_LINE", "\\n") +
    "', function(data){console.log(data)})";
  page.evaluate(scriptToSendText);
}

/*
|=================================================================
|   +  To get all unread message as 'get_unread_response' event
|=================================================================
*/
function getUnreadReplies(done) {
  var scriptToSendText = "window.WAPI.getUnreadMessages2()";
  var unread_data = [];
  page.evaluate(scriptToSendText).then(data => {
    data.forEach(single_chat_data => {
      var chat = single_chat_data.formattedName;
      var isGroup = single_chat_data.isGroup;
      var msgs = [];
      single_chat_data.messages.forEach(each_msg => {
        var msg_load = each_msg.body;
        var contact = each_msg.contact;
        var obs = {
          contact: contact,
          message: msg_load,
          from: each_msg.from
        };
        msgs.push(obs);
      });

      var obj = {
        chat: chat,
        isGroup: isGroup,
        messages: msgs
      };
      unread_data.push(obj);
    });
    if (done !== undefined) done(unread_data);
    else return unread_data;
  });
}

/*
|=================================================================
|   +  To send seen to messages - you require message ID
|       - message ID can be found in 'from' param from
|         'get_unread_response' event on Socket IO
|=================================================================
*/
function sendSeenNotification(msg) {
  var chat_to_see = msg.msg_id;
  var scriptToSendSeen =
    "window.WAPI.sendSeen('" +
    chat_to_see +
    "', function(data){console.log(data)})";
  page.evaluate(scriptToSendSeen);
}

/*
|=================================================================
|   +  Utils here !!!
|=================================================================
*/
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};
