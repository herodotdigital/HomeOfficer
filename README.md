# HomeOfficer

`homeofficer` is a tool which allows to report events like holiday and home-office by employees. 

`homeofficer` uses a Slack slash command which report events and save it inside [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1kJXkLKA9EkLbaKZqTQfMvHzFHP674IU4SxvK4E7_b5k/edit#gid=0).

Usage is simple:
```
$ /homeoffice from 03 May 2016 to 05 May 2016
$ /homeoffice 05 April 2016
$ /vacation tomorrow
```

### Mail sending
After successful save of an event `homeofficer` will send an e-mail to project manager or to default e-mail address. Mail sending is handled by [Mailgun service](www.mailgun.com)

## Instalation
Fork/download the project. After that, you have to create few settings-file for 3rd party integrations which are:
1. Slack
2. Google spreadsheet
3. Mailgun

What you need to provide are files:

```
$(projectSource)/settings/slackKeys.json
$(projectSource)/settings/mailgunKeys.json
$(projectSource)/settings/googleSpreadsheetKeys.json
$(projectSource)/settings/googleConsoleCertificate.json
```

Check sample files to see the JSON structure.
### Short description of each file:
- **slackKeys.json** - it contains token for [SlackBot](https://api.slack.com/bot-users) and list of [verification tokens](https://api.slack.com/slash-commands) for each slash commands
- **mailgunKeys.json** - it contains URL and authetication data for [Mailgun service](https://mailgun.com/cp)
- **googleSpreadsheetKeys.json** - it contains the id of your spreadsheet (you can get it from your spreadsheet URL)
- **googleConsoleCertificate.json** - it is a file generated in [Google Console](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount)



## Developing new features
Adding new features to `homeofficer` is simple. Fork the project, write some code and create a pull request.

## Rules & flow

### Report rules
Currently `homeofficer` supports 2 types of `WorkEvent`:
1. `RemoteEvent`
2. `VacationEvent`. 

There are batch of rules when events can be reported:

1. Remote work needs to be reported a day before until 3PM
2. Vacation for 1-3 days needs to be reported 2 weeks earlier.
3. Vacation greater than 3 days needs to be reported at least a 1-month earlier.

# License
The MIT License (MIT)
Copyright (c) 2016 AIM sp z o.o.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.