var events = [];
var currentStudent = 0;

const {dialog} = require('electron').remote;

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

     events.push({id: 0, items: [], total: 0 });
}

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
     console.log(events[currentStudent].total);
     updateCSA(events[currentStudent].total);
     
}

function delStudent(o) {
     var p = o.parentNode.parentNode;
     var i = o.parentNode.parentNode.cellIndex;
     p.parentNode.removeChild(p);
     events.splice(i, 1);
}

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
}

function updateHrs(o) {
     var i = o.parentNode.parentNode.rowIndex;
     events[currentStudent].items[i-1].hours = o.value;
}

function updateEvent(o) {
     var i = o.parentNode.parentNode.rowIndex;
     events[currentStudent].items[i-1].event = o.value;
}

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

function delEvent(o) {
     var p = o.parentNode.parentNode;
     var i = o.parentNode.parentNode.cellIndex;
     p.parentNode.removeChild(p);
     events[currentStudent].items.splice(i - 1, 1);
}

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