const fs = require('fs');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

var spreadsheetId = null;

function accessSheets() {
     fs.readFile('credentials.json', (err, content) => {
          if (err) return console.log('Error loading client secret file:', err);
          authorize(JSON.parse(content), openSheet);
        });
        
};

function createNewSheet() {
     fs.readFile('credentials.json', (err, content) => {
          if(err) return console.log('Error loading client secret file: ', err);
          authorize(JSON.parse(content), newSheet);
     })
}

function saveSheet() {
     fs.readFile('credentials.json', (err, content) => {
          if(err) return console.log('Error loading client secret file: ', err);
          authorize(JSON.parse(content), updateSheet);
     })
}

function authorize(credentials, callback) {
     const {client_secret, client_id, redirect_uris} = credentials.web;
     const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
   
     fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getNewToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client);
     });
}

function getNewToken(oAuth2Client, callback) {
     const authUrl = oAuth2Client.generateAuthUrl({
       access_type: 'offline',
       scope: SCOPES,
       redirect_uris: 'http://localhost'
     });
     const { remote } = require('electron');
     let win = new remote.BrowserWindow({
          parent: remote.getCurrentWindow(),
          modal: true,
          autoHideMenuBar: true,
          width: 360,
          height: 585,
          resizable: false,
          webPreferences: {
               nodeIntegration: false,
               webSecurity: false
          }
     });
     
     win.on('closed', () => { console.error("Closed before handled")});
     win.loadURL(authUrl);
     win.webContents.on('will-redirect', (event, url) => {
          console.log("New URL: " + url)
          const {parse} = require('url');
          const query = parse(url, true).query
          if (query) {
               if (query.error) {
                    console.error(query.error);
                    return;
               } else if (query.code) {
                    win.removeAllListeners('closed')
                    win.close();
                    oAuth2Client.getToken(query.code, (err, token) => {
                         if (err) return console.error('Error while trying to retrieve access token', err);
                         oAuth2Client.setCredentials(token);
                         fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                              if (err) return console.error(err);
                              console.log('Token stored to', TOKEN_PATH);
                         });
                         callback(oAuth2Client);
                    });
               }
          }
     });
     console.log(authUrl);
}

function openSheet(auth) {
     const sheets = google.sheets({version: 'v4', auth});
     var query = document.getElementById('google-sheet-loc').value.match('(?<=d\/)(.*)(?=\/)');
     if (query == null) {
          const options = {
               title: 'FBLA Logger',
               type: 'error',
               message: 'URL is incorrect',
               detail: 'Use the URL of the spreadsheet'
          };
          dialog.showMessageBox(null, options);
          return;
     }
     sheets.spreadsheets.values.get({
          spreadsheetId: document.getElementById('google-sheet-loc').value.match('(?<=d\/)(.*)(?=\/)')[1],
          range: 'Students!A2:E',
     }, (err, res) => {
          if (err) {
               console.log('The API returned an error: ' + err);
               const options = {
                    title: 'FBLA Logger',
                    type: 'error',
                    message: 'Could not open spreadsheet',
                    detail: err
               };
               dialog.showMessageBox(null, options);
               return;
          }
          const rows = res.data.values;
          if (rows.length) {
               document.getElementById('editor-table').getElementsByTagName('tbody')[0].innerHTML = "";
               rows.map((row) => {
                    addStudentValues(row);
               });
          } else {
               console.log('No data found.');
          }
          console.log(res);
     });
     sheets.spreadsheets.values.get({
          spreadsheetId: document.getElementById('google-sheet-loc').value.match('(?<=d\/)(.*)(?=\/)')[1],
          range: 'Events!A2:C',
     }, (err, res) => {
          if (err) {
               console.log('The API returned an error: ' + err);
               const options = {
                    title: 'FBLA Logger',
                    type: 'error',
                    message: 'Could not open spreadsheet',
                    detail: err
               };
               dialog.showMessageBox(null, options);
               return;
          }
          const rows = res.data.values;
          if (rows.length) {
               events = [];
               rows.map((row) => {
                    addEventValuesFromSheet(row);
               });
          } else {
               console.log('No data found.');
          }
          console.log(res);
     });
     const options = {
          title: 'FBLA Logger',
          type: 'info',
          message: 'Opened spreadsheet successfully!'
     };
     dialog.showMessageBox(null, options);
     spreadsheetId = query;
}

function newSheet(auth) {
     const sheets = google.sheets({version: 'v4', auth});
     var request = {
          resource: {
               properties: {
                    title: document.getElementById('newGoogleSheetName').value
               },
               sheets: [
                    {
                         properties: {
                              sheetId: 0,
                              title: "Students",
                              sheetType: "GRID",
                              index: 0,
                              gridProperties: {
                                   columnCount: 6
                              }
                         },
                         data: [
                              {
                                   startRow: 0,
                                   startColumn: 0,
                                   rowData: [
                                        {
                                             values: [
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "Student Number"
                                                       }
                                                  },
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "First Name"
                                                       }
                                                  },
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "Last Name"
                                                       }
                                                  },
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "Grade Level"
                                                       }
                                                  },
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "Community Hours"
                                                       }
                                                  },
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "Community Service Award"
                                                       }
                                                  }
                                             ]
                                        }
                                   ],
                                   columnMetadata: [
                                        {
                                             pixelSize: 175
                                        },
                                        {
                                             pixelSize: 175
                                        },
                                        {
                                             pixelSize: 175
                                        },
                                        {
                                             pixelSize: 175
                                        },
                                        {
                                             pixelSize: 175
                                        },
                                        {
                                             pixelSize: 175
                                        }
                                   ]
                              }
                         ]
                    },
                    {
                         properties: {
                              sheetId: 1,
                              title: "Events",
                              sheetType: "GRID",
                              index: 1,
                              gridProperties: {
                                   columnCount: 3
                              }
                         },
                         data : [
                              {
                                   startRow: 0,
                                   startColumn: 0,
                                   rowData: [
                                        {
                                             values: [
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "User Number"
                                                       }
                                                  },
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "Event"
                                                       }
                                                  },
                                                  {
                                                       userEnteredValue: {
                                                            stringValue: "Hours"
                                                       }
                                                  }
                                             ]
                                        }
                                   ],
                                   columnMetadata: [
                                        {
                                             pixelSize: 175
                                        },
                                        {
                                             pixelSize: 175
                                        },
                                        {
                                             pixelSize: 175
                                        }
                                   ]
                              }
                         ]
                    }
               ]
          },
          auth: auth
     };

     request.resource.sheets[0].data[0].rowData.push(...tableToObject());

     request.resource.sheets[1].data[0].rowData.push(...eventsToObject());

     sheets.spreadsheets.create(request, function(err, response) {
          if (err) {
               console.error(err);
               const options = {
                    title: 'FBLA Logger',
                    type: 'error',
                    message: 'Could not create spreadsheet',
                    detail: err
               };
               dialog.showMessageBox(null, options);
               return;
          }

          const options = {
               title: 'FBLA Logger',
               type: 'info',
               message: 'Created spreadsheet successfully!',
               detail: response.data.spreadsheetUrl
          };
          dialog.showMessageBox(null, options);
          spreadsheetId = response.data.spreadsheetId;
     });
}

function tableToObject() {
     var o = [];
     var tableRef = document.getElementById('editor-table').getElementsByTagName('tbody')[0];
     for (var i = 0; i < tableRef.rows.length; i++) {
          var row = tableRef.rows[i];
          var item = {
               values: []
          }
          for (var j = 0; j < 6; j++) {
               var child = row.cells[j].children[0];
               if (j == 0) {
                    item.values.push({userEnteredValue: { numberValue: child.value } });
               }
               else if (j == 1) {
                    item.values.push({userEnteredValue: { stringValue: child.value } });
               }
               else if (j == 2) {
                    item.values.push({userEnteredValue: { stringValue: child.value } });
               }
               else if (j == 3) {
                    item.values.push({userEnteredValue: { numberValue: child.value } });
               }
               else if (j == 4) {
                    item.values.push({userEnteredValue: { formulaValue: '=SUM(FILTER(Events!C2:C, Events!A2:A=A' + (i + 2) + '))' }});
               }
               else if (j == 5) {
                    item.values.push({userEnteredValue: { formulaValue: '=IFS(E'+ (i + 2) + ' >= 500, "CSA Achievement", E' + (i + 2) + ' >= 200, "CSA Service", E' + (i + 2) + ' >= 50, "CSA Community", TRUE, "NA")' }});
               }
          }
          o.push(item);
     }
     return o;
}

function eventsToObject() {
     var o = [];
     for (var i = 0; i < events.length; i++) {
          for (var j = 0; j < events[i].items.length; j++) {
               var item = {
                    values: [
                         {
                              userEnteredValue: {
                                   numberValue: events[i].id
                              }
                         },
                         {
                              userEnteredValue: {
                                   stringValue: events[i].items[j].event
                              }     
                         },
                         {
                              userEnteredValue: {
                                   numberValue: events[i].items[j].hours
                              }
                         }
                    ]
               };
               o.push(item);
          }
     }
     return o;
}

function updateSheet(auth) {
     if (spreadsheetId == null) {
          const options = {
               title: 'FBLA Logger',
               type: 'error',
               message: 'No open Google spreadsheet to save',
               detail: 'Create or open a Google spreadsheet first'
          };
          dialog.showMessageBox(null, options);
          return;
     }
     const sheets = google.sheets({version: 'v4', auth});
     var request = {
          spreadsheetId: spreadsheetId,
          resource: {
               requests: [
                    {
                         updateCells: {
                              range: {
                                   sheetId: 0,
                                   startRowIndex: 1,
                                   startColumnIndex: 0,
                                   endColumnIndex: 6
                              },
                              fields : "*",
                              rows: []
                         }
                    },
                    {
                         updateCells: {
                              range: {
                                   sheetId: 1,
                                   startRowIndex: 1,
                                   startColumnIndex: 0,
                                   endColumnIndex: 3
                              },
                              fields : "*",
                              rows: []
                         }
                    }
               ]
          },
          auth: auth
     };

     request.resource.requests[0].updateCells.rows.push(...tableToObject());

     request.resource.requests[1].updateCells.rows.push(...eventsToObject());

     sheets.spreadsheets.batchUpdate(request, function(err, response) {
          if (err) {
               console.error(err);
               const options = {
                    title: 'FBLA Logger',
                    type: 'error',
                    message: 'Could not save spreadsheet',
                    detail: err
               };
               dialog.showMessageBox(null, options);
               return;
          }

          const options = {
               title: 'FBLA Logger',
               type: 'info',
               message: 'Saved spreadsheet successfully!',
               detail: response.data.spreadsheetUrl
          };
          dialog.showMessageBox(null, options);

     });

}