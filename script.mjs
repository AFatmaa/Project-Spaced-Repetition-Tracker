import { getUserIds } from "./common.mjs";
import { getData, addData, clearData } from "./storage.mjs";

// This function adds user options to the dropdown menu
function populateUserDropdown() {
  const userSelect = document.getElementById("user-select"); 
  const users = getUserIds();  // Get the list of user IDs (it's an array)

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a user";
  userSelect.appendChild(defaultOption);

  // Loop through the user IDs and create an <option> for each
  users.forEach((userId) => {
    const option = document.createElement("option");
    option.value = userId;
    option.textContent = `User ${userId}`;
    userSelect.appendChild(option);
  });
}

const addTopicForm = document.getElementById("add-topic");
const topicNameInput = document.getElementById("topic-name");
const dateInput = document.getElementById("start-date");

// Sets the date input's value to today's date
function setDefaultDate() {
   dateInput.valueAsDate = new Date();
}

function handleTopicSubmit(event) {
 event.preventDefault();

 const userId = document.getElementById('user-select').value;
 const topicName = topicNameInput.value.trim(); // .trim() removes whitespace from the topic name
 const startDate = dateInput.value;

 if (!userId) {
  alert("Please select a user first!");
  return;
}

 if (!topicName || !startDate) {
   alert("Please enter both topic name and start date.");
   return;
 }

// Generate spaced repetition dates
const revisionDates = calculateReviewDates(startDate);

// Prepare agenda items to save
const agendaItems = revisionDates.map(date => ({
  topic: topicName,
  date: date,
}));

// Save agenda items for the selected user
 addData(userId, agendaItems);

// Refresh the agenda display
 getUserInfo(userId);

 addTopicForm.reset();
 setDefaultDate();
}

// This ensures the function runs when the user either clicks the submit button or presses the Enter key.
addTopicForm.addEventListener("submit", handleTopicSubmit);

// Returns a filtered and chronologically sorted list of agenda items
function getSortedFutureAgenda(data) {
  if (!data || !Array.isArray(data)) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return data
    .filter(item => {  // Only keep future or today’s topics
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= today;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort from earliest to latest
}

// Display user data in table or show message if no data
function getUserInfo(userId) {
  const noDataMsg = document.getElementById("NoData");
  const table = document.getElementById("userData");
  const tbody = document.getElementById("userInfo");

  //clear previous data
  tbody.innerHTML = "";

  // if user data is not select no table and message 
  if (!userId){
    table.style.display = "none";
    noDataMsg.style.display = "none";
    return;
  }

  const userData = getData(userId);
  const futureAgenda = getSortedFutureAgenda(userData);

  // check if there is data to display
  if (futureAgenda && futureAgenda.length > 0) {
    noDataMsg.style.display = "none";
    table.style.display = "table";

    //populate table rows
    futureAgenda.forEach((item,index) => {
      const row = document.createElement("tr");
      row.innerHTML = 
                      `<td>${index +1}</td>
                      <td>${item.topic}</td>
                      <td>${item.date}</td>
                      <td>
                        <button class="delete-btn">Delete</button>
                      </td>`;

        const deleteBtn = row.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => {
        const allUserData = getData(userId);

        if (!allUserData) return; // do nothing if there's no agenda

        // create a new array containing all items except for the one to be deleted
        // match both the topic and the date to ensure we delete the correct item
        const updatedUserData = allUserData.filter(dataItem => {
          return dataItem.topic !== item.topic || dataItem.date !== item.date;
        });

        // clear the users old data from storage
        clearData(userId);
        
        // add updated data back to storage, if any items remain
        if (updatedUserData.length > 0) {
            addData(userId, updatedUserData);
        }

        // redraw the table with the latest data from storage
        getUserInfo(userId);
      });
      
      tbody.appendChild(row);
    });  
  } else {
    table.style.display = "none";
    noDataMsg.style.display = "block";
    noDataMsg.textContent = "No agenda available"
  }
}

// function to calculate dates
export function calculateReviewDates(startDateStr)
{
  // convert string to Date object 
  const startDate = new Date(startDateStr + 'T00:00:00Z');

  // Define schedule 
  const schedule = [{days:7},{months:1},{months:3},{months:6},{years:1}];

  // for put the result of dates
  const revisionDates = [];  

  for (const item of schedule) {
    const newDate = new Date(startDate);

    // Set default values in case some fields are undefined
    const days = item.days || 0;
    const months = item.months || 0;
    const years = item.years || 0;

    newDate.setUTCDate(newDate.getUTCDate()+days);

    const originalDay = newDate.getUTCDate();
    newDate.setUTCMonth(newDate.getUTCMonth()+months);
    if (newDate.getUTCDate()< originalDay){
      newDate.setUTCDate(0);
    }
    newDate.setUTCFullYear(newDate.getUTCFullYear()+years);

    revisionDates.push(formatDate(newDate))

  }
  return revisionDates;
}

// function to format date like YYYY-MM-DD only and remove time
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

window.onload = () => {
  document.getElementById("userData").style.display = "none";
  document.getElementById("NoData").style.display = "none";
  populateUserDropdown();
  setDefaultDate();
};

document.getElementById("user-select").addEventListener("change", (e) => {
  const selectedUserId = e.target.value;
  getUserInfo(selectedUserId);
});

export { getUserInfo };
