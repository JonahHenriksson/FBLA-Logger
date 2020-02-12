var events = []; // Array of events, since the popup is used multiple times, there must be a way to store the events
var currentStudent = 0; // Current student opened by pop up

const {dialog} = require('electron').remote;

// Switch to a tab
function openTab(evt, tabName) {
    var i, tabcontent, tabs;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tabs = document.getElementsByClassName("tab");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].className = tabs[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    document.getElementById("info-bar").innerText = "Logger>" + tabName;
}

// Add a student when button is pressed
function addStudent() {
     var row = document.getElementById("editor-table").getElementsByTagName("tbody")[0].insertRow(-1);
     var id = row.insertCell(0);
     var fname = row.insertCell(1);
     var lname = row.insertCell(2);
     var glvl = row.insertCell(3);
     var hrs = row.insertCell(4);
     var csa = row.insertCell(5);
     var del = row.insertCell(6);

     id.innerHTML = '<input class="table-inputs id" type="number" onchange="updateStudentNumber(this)"></input>';
     fname.innerHTML = '<input class="table-inputs fname" type="text"></input>';
     lname.innerHTML = '<input class="table-inputs lname" type="text"></input>';
     glvl.innerHTML = '<input class="table-inputs glvl" type="number"></input>';
     hrs.innerHTML = '<button class="table-inputs hrs" onclick="editHrs(this)">0</button>';
     csa.innerHTML = 'NA';
     del.innerHTML = '<button class="student-del-btns" onclick="delStudent(this)"></button>';

     events.push({ items: [] });
}

// Add student from a row of values, used when opening a file
function addStudentValues(values) {
     var row = document.getElementById("editor-table").getElementsByTagName("tbody")[0].insertRow(-1);
     var id = row.insertCell(0);
     var fname = row.insertCell(1);
     var lname = row.insertCell(2);
     var glvl = row.insertCell(3);
     var hrs = row.insertCell(4);
     var csa = row.insertCell(5);
     var del = row.insertCell(6);

     id.innerHTML = '<input class="table-inputs id" type="number" onchange="updateStudentNumber(this)"></input>';
     fname.innerHTML = '<input class="table-inputs fname" type="text"></input>';
     lname.innerHTML = '<input class="table-inputs lname" type="text"></input>';
     glvl.innerHTML = '<input class="table-inputs glvl" type="number"></input>';
     hrs.innerHTML = '<button class="table-inputs hrs" onclick="editHrs(this)">0</button>';
     csa.innerHTML = 'NA';
     del.innerHTML = '<button class="student-del-btns" onclick="delStudent(this)"></button>';

     id.children[0].value = values[0];
     fname.children[0].value = values[1]
     lname.children[0].value = values[2];
     glvl.children[0].value = values[3];

     events.push({id: values[0], items: [], total: 0 });
}

// Add event from row of values, used when opening a file
function addEventValuesFromSheet(row) {
     var tableRef = document.getElementById('editor-table').getElementsByTagName('tbody')[0];
     for (var j = 0; j < events.length; j++) {
          if (events[j].id == row[0]) {
               events[j].items.push({event: row[1], hours: row[2]});
               events[j].total += row[2];
               currentStudent = j;
               updateCSA(events[j].total);
               tableRef.rows[currentStudent].cells[4].children[0].innerHTML = events[j].total;
               return;
          }
     }
     currentStudent = events.length;
     events.push({id: row[0], items: [{event: row[1], hours: row[2]}], total: row[2]});
     tableRef.rows[currentStudent].cells[4].children[0].innerHTML = events[currentStudent].total;
     updateCSA(events[currentStudent].total);
     
}

// Delete a student
function delStudent(o) {
     var p = o.parentNode.parentNode;
     var i = o.parentNode.parentNode.rowIndex - 1;
     p.parentNode.removeChild(p);
     events.splice(i, 1);
     
}

// Open the events popup and populates it with relevant data
function editHrs(o) {
     var i = o.parentNode.parentNode.rowIndex;
     var canvas = document.getElementById('popup-canvas');
     canvas.style.display = 'block';
     document.getElementById("info-bar").innerText = ("Logger>Editor>Student_" + i + ">Events");
     currentStudent = i - 1;
     var tableRef = document.getElementById('events-table').getElementsByTagName('tbody')[0];
     tableRef.innerHTML = "";
     addEventValues();
     document.getElementById("blocker").style.display = "block";
}

// Add an event when button is pressed
function addEvent() {
     var row = document.getElementById('events-table').getElementsByTagName("tbody")[0].insertRow(-1);
     var event = row.insertCell(0);
     var hrs = row.insertCell(1);
     var del = row.insertCell(2);

     event.innerHTML = '<input type="text" onchange="updateEvent(this)"></input>';
     hrs.innerHTML = '<input type="number" onchange="updateHrs(this)"></input>';
     del.innerHTML = '<button class="event-del-btns" onclick="delEvent(this)"></button';

     events[currentStudent].items.push({ event: "", hours: 0 });
}

// Populates event popup table with student events
function addEventValues() {
     for (var i = 0; i < events[currentStudent].items.length; i++) {
          var row = document.getElementById('events-table').getElementsByTagName("tbody")[0].insertRow(-1);
          var event = row.insertCell(0);
          var hrs = row.insertCell(1);
          var del = row.insertCell(2);

          event.innerHTML = '<input type="text" onchange="updateEvent(this)"></input>';
          hrs.innerHTML = '<input type="number" onchange="updateHrs(this)"></input>';
          del.innerHTML = '<button class="event-del-btns" onclick="delEvent(this)"></button';

          event.children[0].value = events[currentStudent].items[i].event;
          hrs.children[0].value = events[currentStudent].items[i].hours;
     }
}

// Checks if the student number is unique and sets the id to it, called on change
function updateStudentNumber(o) {
     var tableRef = document.getElementById("editor-table").getElementsByTagName("tbody")[0];
     if (o.value != "") {
          for (var i = 0; i < tableRef.rows.length; i++) {
               if (o.parentNode.parentNode.rowIndex - 1 != i && o.value == tableRef.rows[i].cells[0].children[0].value) {
                    const options = {
                         title: 'FBLA Logger',
                         type: 'error',
                         message: 'This value was not unique',
                         detail: 'Please enter a unique value'
                    };
                    dialog.showMessageBox(null, options);
                    o.value = "";
               }
          }
     }
     events[o.parentNode.parentNode.rowIndex - 1].id = o.value;
}

// Update the event hours
function updateHrs(o) {
     var i = o.parentNode.parentNode.rowIndex;
     events[currentStudent].items[i-1].hours = o.value;
}

// update event description/name
function updateEvent(o) {
     var i = o.parentNode.parentNode.rowIndex;
     events[currentStudent].items[i-1].event = o.value;
}

// Update CSA based on total hours
function updateCSA(v) {
     var x;
     if (v >= 500) {
          x = "CSA Achievement";
     }
     else if (v >= 200) {
          x = "CSA Service";
     }
     else if (v >= 50) {
          x = "CSA Community";
     }
     else {
          x = "NA";
     }

     var tableRef = document.getElementById('editor-table').getElementsByTagName('tbody')[0];
     tableRef.rows[currentStudent].cells[5].innerText = x;
}

// Delete an event from student
function delEvent(o) {
     var p = o.parentNode.parentNode;
     var i = o.parentNode.parentNode.cellIndex;
     p.parentNode.removeChild(p);
     events[currentStudent].items.splice(i - 1, 1);
}

// Close the event popup
function closeHrs() {
     var canvas = document.getElementById('popup-canvas');
     canvas.style.display = 'none';
     document.getElementById("info-bar").innerText = ("Logger>Editor");

     var total = 0;
     for (var j = 0; j < events[currentStudent].items.length; j++) {
          total += +events[currentStudent].items[j].hours;
          console.log(events[currentStudent].items[j].hours);
     }

     var tableRef = document.getElementById('editor-table').getElementsByTagName('tbody')[0];
     tableRef.rows[currentStudent].cells[4].children[0].innerText = total;
     updateCSA(total);
     events[currentStudent].hours = total;
     document.getElementById("blocker").style.display = "none";
}

// Open the CSA report popup and update the report
function openCSAReport() {
     document.getElementById("blocker").style.display = "block";
     var report = document.getElementById('category-report');
     report.style.display = 'block';
     document.getElementById("info-bar").innerText = ("Logger>Editor>CSA_Report");
     var tableRef = document.getElementById("editor-table").getElementsByTagName("tbody")[0];
     var na = 0;
     var csac = 0;
     var csas = 0;
     var csaa = 0;
     for (var i = 0; i < tableRef.rows.length; i++) {
          var v = tableRef.rows[i].cells[5].innerText;
          var h = tableRef.rows[i].cells[4].children[0].innerText;
          if (v == "NA") {
               na += +h;
          }
          else if (v == "CSA Community") {
               csac += +h;
          }
          else if (v == "CSA Service") {
               csas += +h;
          }
          else if (v == "CSA Achievement") {
               csaa += +h;
          }
     }
     document.getElementById('csa-na-value').innerText = na;
     document.getElementById('csa-community-value').innerText = csac;
     document.getElementById('csa-service-value').innerText = csas;
     document.getElementById('csa-achievement-value').innerText = csaa;

}

// Close the CSA report popup
function closeCSAReport() {
     document.getElementById("blocker").style.display = "none";
     document.getElementById('category-report').style.display = 'none';
     document.getElementById("info-bar").innerText = ("Logger>Editor");

}

// Set window button handlers to appropriate functions
(function () {

    const {BrowserWindow} = require('electron').remote; 

   function init() { 
        document.getElementById("min-btn").addEventListener("click", function (e) {
             var window = BrowserWindow.getFocusedWindow();
             window.minimize(); 
        });

        document.getElementById("max-btn").addEventListener("click", function (e) {
             var window = BrowserWindow.getFocusedWindow(); 
             if (window.isMaximized() == true) {
                  window.restore();
                  e.target.style.background = "url('../style/icons/maximize-btn.png') no-repeat";
                  e.target.style.backgroundSize = "30%";
                  e.target.style.backgroundPosition = "center";
             } else {
               window.maximize();
               e.target.style.background = "url('../style/icons/restore-btn.png') no-repeat";
                  e.target.style.backgroundSize = "30%";
                  e.target.style.backgroundPosition = "center";
             }
        });

        document.getElementById("close-btn").addEventListener("click", function (e) {
             var window = BrowserWindow.getFocusedWindow();
             window.close();
        }); 
   }; 

   document.onreadystatechange = function () {
        if (document.readyState == "complete") {
             init(); 
        }
   };

})();

// Open save dialog
function saveLocalDialog() {
     var remote = require('electron').remote;
     var app = remote.app;
     var userChosenPath = dialog.showSaveDialogSync({"defaultPath": app.defaultPath, "filters": [{"name": 'JSON', "extensions":['json']}]});

     if (userChosenPath) {
          saveLocal(userChosenPath, generateLocalFile());
     }
}

// Saves content to path
function saveLocal(path, content) {
     var fs = require('fs');
     try {
          fs.writeFileSync(path, content, 'utf-8');
     }
     catch (e) {
          const options = {
               title: 'FBLA Logger',
               type: 'error',
               message: 'Failed to save file'
          };
          dialog.showMessageBox(null, options);
     }
}

// Creates the content for file
function generateLocalFile() {
     console.log(JSON.stringify({ student: tableToObject(), events: eventsToObject() }));
     return JSON.stringify({ students: tableToObject(), events: eventsToObject() });
}

// Open open dialog
function openLocalDialog() {
     var remote = require('electron').remote;
     var app = remote.app;
     var userChosenPath = dialog.showOpenDialogSync({"defaultPath": app.defaultPath, "filters": [{"name": 'JSON', "extensions":['json']}]});

     if (userChosenPath) {
          openLocal(userChosenPath[0]);
     }
}

// open local file
function openLocal(path) {
     var fs = require('fs');
     fs.readFile(path, 'utf-8', function (err, data) {
          if (err) {
               const options = {
                    title: 'FBLA Logger',
                    type: 'error',
                    message: 'Failed to save file'
               };
               dialog.showMessageBox(null, options);
               return;
          }
          else {
               loadFile(data);
          }
     });
}

// Parses data to tables
function loadFile(data) {
     var obj = JSON.parse(data);
     for (var i = 0; i < obj.students.length; i++) {
          addStudentValues([
               +obj.students[i].values[0].userEnteredValue.numberValue,
               obj.students[i].values[1].userEnteredValue.stringValue,
               obj.students[i].values[2].userEnteredValue.stringValue,
               +obj.students[i].values[3].userEnteredValue.numberValue
          ]);
     }
     for (var j = 0; j < obj.events.length; j++) {
          addEventValuesFromSheet([
               +obj.events[j].values[0].userEnteredValue.numberValue,
               obj.events[j].values[1].userEnteredValue.stringValue,
               +obj.events[j].values[2].userEnteredValue.numberValue
          ]);
     }
}