<p align="center">
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSpkzb6HDiERinGs5C5RjWMYMndyHh0ZrUml7PwIHDaxdRxgdK">
</p>

## Prerequisite

- doker

## Installing

1.  Go to app root directory
2.  Enter your server ip in `example/custom.js` and `example.test.html` in place of `116.12.51.202:3000` text.
3.  Run `docker build --rm -f "Dockerfile" -t vampirewhatsapp-v2 .`
4.  Run `docker run -p 3000:3000  -d vampirewhatsapp-v2:latest`
5.  Server will be live at port `3000`

## Socket listners

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

## Extra
Assunming you are running server at `116.12.51.202:3000`
- `116.12.51.202:3000/screenshot` gives you the snapshot of the browser
- `116.12.51.202:3000/refresh` reloads the browser page
### Things to note

- Never start multiple instance of the server(You will get an address already in use error)
- `pm2 list` command can be used to list all running process
- `pm2 stop <id>` command can be used to stop a particular process.you can see process id using above command.
- For more information about this package go to https://www.npmjs.com/package/pm2

### `assets/Whatsapp.js` contains all methods needed to do various operation in whatsapp

Note : Every method is well documented in file itself

### How whatsapp.js id getting injected

- It wait's for the qr page to disappear
- The script is injected in the puppeteer once user is logged in
- If the injection turned out to be insuccessfull then it reloads the page and re-attempt so we can we sure that the operation won't fail

## Author

Amit (im-Amitto)
