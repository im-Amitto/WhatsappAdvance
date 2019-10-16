<p align="center">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSpkzb6HDiERinGs5C5RjWMYMndyHh0ZrUml7PwIHDaxdRxgdK">
</p>

## Prerequisite

- Node 10+
- NPM 6+
- Firefox

## Installing

1.  Clone/Download/Extract the code
2.  Enter your server ip in `example/custom.js` and `example.test.html` in place of `18.222.203.217:3000` text.
3.  Run `npm install` in the project directory folder.
4.  Run `npm install pm2 -g`
5.  Run `pm2 start index.js --watch` to start the server.

## Getting Started

1.  The socket client must send data in following format which contains following parameters as json --
    a) To send text messages (country code to be added in start)

    ```
    EVENT: 'send_text_message'
    {
      message: 'YOUR MESSAGE HERE',
      mobile_number: '91XXXXXXXXXX'
    }
    ```

    b) To send files (country code to be added in start)

    ```
    EVENT: 'send_file_message'
    {
      message: 'YOUR MESSAGE HERE',
      mobile_number: '91XXXXXXXXXX',
      type: 'FILE MIME TYPE',
      caption: 'FILE CAPTION (ONLY IN CASE OF IMAGES and VIDEOS)'
    }
    ```

    c) To get all unread messages

    ```
    EVENT: 'get_unread_replies'
    {
      payload: 'not required'
    }
    RESPONSE EVENT: 'get_unread_response'
    ```

    d) To send seen (country code to be added in start)

    ```
    EVENT: 'send_seen_reply'
    {
      msg_id: 'msg id you get form the response of the event "get_unread_response"'
    }
    ```

    e) To get background running headless firefox session status

    ```
    EVENT: 'check_session'
    {
      payload: 'not required'
    }
    RESPONSE EVENT: 'session_status'
    ```

    f) To restart background running headless firefox session

    ```
    EVENT: 'restart_session'
    {
      payload: 'not required'
    }
    ```

    g) To get qr code

    ```
    EVENT: 'get_QR_code'
    {
      payload: 'not required'
    }
    RESPONSE EVENT: 'get_QR_code_response'
    ```

    h) To get Login status

    ```
    EVENT: 'get_login_status'
    {
      payload: 'not required'
    }
    RESPONSE EVENT: 'is_logged_in_response'
    ```

    Note: Check out [socket.io](https://socket.io/) to understand how to trigger these events

2.  run `pm2 start index.js --watch` in cmd in root directory of the project.

## How it's working

- It's using selenium-webdriver to spawn a headless firefox with whatsapp web url
- We have a flag on server side with has deafult value set to false and changed to true when user successfully logged in. It is used to decide which event should be ignored when a user is not logged in
- We are using the assertion on classname presence to decide the current page location
- From front end `get unread message` and `get qr request` is fired every one second. if a user is not logged in that means their exist a qr on the webpage so backend send that qr to front end or else it just send all unread messages
- We have four functionalities which can be fired manually
  - Send Message
  - Send File
  - Send Seen status

## Extra

### Things to note

- Never start multiple instance of the server(You will get an address already in use error)
- `pm2 list` command can be used to list all running process
- `pm2 stop <id>` command can be used to stop a particular process.you can see process id using above command.
- For more information about this package go to https://www.npmjs.com/package/pm2

### `assets/Whatsapp.js` contains all methods needed to do various operation in whatsapp

Note : Every method is well documented in file itself

### How we are using methods from whatsapp.js

- We can simply call the function using executequery method of selenium-webdriver

### How whatsapp.js id getting injected

- It wait's for the qr page to disappear
- The script is injected in the headless browser using selenium-webdriver once user is logged in
- If the injection turned out to be insuccessfull then it reploads the page and reattempt so we can we sure that the operation won't fail

## Author

Amit (im-Amitto)
