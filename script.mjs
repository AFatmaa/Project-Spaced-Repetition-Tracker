import { getUserIds } from "./common.mjs";
import { getData, addData, clearData } from "./storage.mjs";

// --- CONSTANTS ---
const userSelect = document.getElementById("user-select"); 
const addTopicForm = document.getElementById("add-topic");
const topicNameInput = document.getElementById("topic-name");
const dateInput = document.getElementById("start-date");
const noDataMsg = document.getElementById("NoData");
const table = document.getElementById("userData");
const tbody = document.getElementById("userInfo");


// Populates the user selection dropdown with user IDs from common.mjs.
function populateUserDropdown() {
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

// Sets the date input's value to today's date
function setDefaultDate() {
   dateInput.valueAsDate = new Date();
}

/**
 * Handles the form submission for adding a new topic.
 * @param {Event} event - The form submission event.
 */
function handleTopicSubmit(event) {
  event.preventDefault();

  const userId = userSelect.value;
  // Remove leading/trailing whitespace to prevent saving empty or messy topic names.
  const topicName = topicNameInput.value.trim(); 
  const startDate = dateInput.value;

  if (!userId) {
    alert("Please select a user first!");
    return;
  }

  if (!topicName || !startDate) {
    alert("Please enter both topic name and start date.");
    return;
  }

  const revisionDates = calculateReviewDates(startDate);
  const agendaItems = revisionDates.map(date => ({
    topic: topicName,
    date: date,
  }));

  addData(userId, agendaItems);
  getUserInfo(userId);

  addTopicForm.reset();
  setDefaultDate();

}

/**
 * Takes a raw list of agenda items and returns a new list containing only
 * future or today's items, sorted chronologically.
 * @param {Array<object>} data - The raw user data from storage.
 * @returns {Array<object>} A sorted and filtered list of agenda items.
 */
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

/**
 * Displays the user's future agenda in a table or shows a message if no data exists.
 * @param {string} userId - The ID of the user whose data to display.
 */
function getUserInfo(userId) {
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
      const row = createAgendaRow(item, index, userId);      
      tbody.appendChild(row);
    });  
  } else {
    table.style.display = "none";
    noDataMsg.style.display = "block";
    noDataMsg.textContent = "No agenda available for this user."
  }
}

/**
 * Creates a table row (<tr>) for a single agenda item.
 * It also attaches a click event to the delete button for that row.
 * @param {object} item - The agenda item containing {topic, date}.
 * @param {number} index - The display number for the row (e.g., 1, 2, 3).
 * @param {string} userId - The ID of the current user, needed for deletion.
 * @returns {HTMLTableRowElement} The fully constructed table row element.
 */
function createAgendaRow(item, index, userId) {
  const row = document.createElement("tr");

  // Create a Date object from the date string stored in the item
  const displayDate = new Date(item.date + 'T00:00:00Z');
  const formattedDate = formatDateForDisplay(displayDate);
  
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${item.topic}</td>
    <td>${formattedDate}</td>
    <td>
      <button class="delete-btn">Delete</button>
    </td>`;

  const deleteBtn = row.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    // Get the most current data from storage before deleting
    const allUserData = getData(userId);
    if (!allUserData) return;

    // Create a new array excluding the item to be deleted
    const updatedUserData = allUserData.filter(dataItem => {
      return dataItem.topic !== item.topic || dataItem.date !== item.date;
    });

    // To update storage, clear all data for the user and add back the filtered list.
    clearData(userId);
    if (updatedUserData.length > 0) {
      addData(userId, updatedUserData);
    }

    // Refresh the view to show the change
    getUserInfo(userId);
  });

  return row;
}

/**
 * Calculates a series of future revision dates based on a start date.
 * @param {string} startDateStr - The start date in "YYYY-MM-DD" format.
 * @returns {Array<string>} A list of formatted revision dates.
 */
export function calculateReviewDates(startDateStr)
{
  // Using 'Z' (Zulu time) ensures we work in UTC, preventing timezone-related bugs
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

    // Handle month overflow e.g., adding 1 month to Jan 31 would result in Mar 3
    // This resets the date to the last day of the correct previous month e.g., Feb 29
    if (newDate.getUTCDate()< originalDay){
      newDate.setUTCDate(0);
    }
    newDate.setUTCFullYear(newDate.getUTCFullYear()+years);

    revisionDates.push(formatDateForStorage(newDate))

  }
  return revisionDates;
}

/**
 * Formats a Date object into a machine-readable "YYYY-MM-DD" string for storage.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDateForStorage(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Formats a Date object into a human-readable "day-th Month Year" string for display.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDateForDisplay(date) {
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  
  let suffix;
  if (day % 10 === 1 && day !== 11) {
    suffix = "st";
  } else if (day % 10 === 2 && day !== 12) {
    suffix = "nd";
  } else if (day % 10 === 3 && day !== 13) {
    suffix = "rd";
  } else {
    suffix = "th";
  }

  return `${day}${suffix} ${month} ${year}`;
}

// Handles form submission via click or Enter key
addTopicForm.addEventListener("submit", handleTopicSubmit);

// Triggers data fetching when a new user is selected from the dropdown
document.getElementById("user-select").addEventListener("change", (e) => {
  const selectedUserId = e.target.value;
  getUserInfo(selectedUserId);
});

// Actions to perform once the page is fully loaded
window.onload = () => {
  document.getElementById("userData").style.display = "none";
  document.getElementById("NoData").style.display = "none";
  populateUserDropdown();
  setDefaultDate();
};

export { getUserInfo };
